import { ImapFlow } from 'imapflow';

async function getClient(user, password) {
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: { user, pass: password },
        logger: false,
    });
    await client.connect();
    return client;
}

function matchSupplier(fromAddress, subject, knownSuppliers) {
    const address = (fromAddress ?? '').toLowerCase();
    const subjectLower = (subject ?? '').toLowerCase();
    return knownSuppliers.find(s => {
        if (!address.includes((s.domain ?? '').toLowerCase())) return false;
        if (s.subjectKeyword) return subjectLower.includes(s.subjectKeyword.toLowerCase());
        return true;
    });
}

const DOC_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

function findAttachmentPart(node) {
    if (!node) return null;

    if ((node.type ?? '').toLowerCase() === 'multipart') {
        for (const child of node.childNodes ?? []) {
            const found = findAttachmentPart(child);
            if (found) return found;
        }
        return null;
    }

    const type = `${node.type}/${node.subtype}`.toLowerCase();
    const filename = node.dispositionParameters?.filename ?? node.parameters?.name;
    const extension = filename?.split('.').pop()?.toLowerCase();
    const isAttachment = node.disposition?.toLowerCase() === 'attachment' || !!filename;
    const isDoc = type === 'application/pdf' || type.startsWith('image/') || DOC_EXTENSIONS.includes(extension ?? '');

    if (isAttachment && isDoc) {
        return { part: node.part, filename: filename ?? `factura.${type.split('/')[1] ?? 'pdf'}`, contentType: type };
    }
    return null;
}

const SEARCH_WINDOW_DAYS = 90;

export async function checkPendingSupplierEmails(user, password, knownSuppliers, excludeUids = []) {
    if (!knownSuppliers || knownSuppliers.length === 0) return [];

    const excluded = new Set(excludeUids);
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const since = new Date(Date.now() - SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        const uids = await client.search({ since }, { uid: true });
        const pending = [];
        if (uids.length > 0) {
            for await (const msg of client.fetch(uids, { envelope: true, bodyStructure: true }, { uid: true })) {
                if (excluded.has(msg.uid)) continue;
                const from = msg.envelope.from?.[0]?.address ?? '';
                const subject = msg.envelope.subject ?? '';
                const supplier = matchSupplier(from, subject, knownSuppliers);
                if (supplier) {
                    pending.push({
                        uid: msg.uid,
                        subject,
                        from,
                        date: msg.envelope.date,
                        supplierName: supplier.name,
                        hasAttachment: !!findAttachmentPart(msg.bodyStructure),
                    });
                }
            }
        }
        return pending;
    } finally {
        lock.release();
        await client.logout();
    }
}

export async function downloadSupplierEmailAttachment(user, password, uid) {
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const message = await client.fetchOne(uid, { bodyStructure: true }, { uid: true });
        if (!message) return null;
        const attachment = findAttachmentPart(message.bodyStructure);
        if (!attachment) return null;

        const { content } = await client.download(uid, attachment.part, { uid: true });
        const chunks = [];
        for await (const chunk of content) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), filename: attachment.filename, contentType: attachment.contentType };
    } finally {
        lock.release();
        await client.logout();
    }
}

export async function markSupplierEmailRead(user, password, uid) {
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        await client.messageFlagsAdd([uid], ['\\Seen'], { uid: true });
    } finally {
        lock.release();
        await client.logout();
    }
}
