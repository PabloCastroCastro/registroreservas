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

function matchSupplier(fromAddress, knownSuppliers) {
    const address = (fromAddress ?? '').toLowerCase();
    return knownSuppliers.find(s => address.includes((s.domain ?? '').toLowerCase()));
}

function findAttachmentPart(node) {
    if (!node) return null;
    const type = `${node.type}/${node.subtype}`.toLowerCase();
    const filename = node.dispositionParameters?.filename ?? node.parameters?.name;
    const isDoc = type === 'application/pdf' || type.startsWith('image/');
    if (isDoc && (node.disposition?.toLowerCase() === 'attachment' || filename) && !node.childNodes) {
        return { part: node.part, filename: filename ?? `factura.${type.split('/')[1]}`, contentType: type };
    }
    for (const child of node.childNodes ?? []) {
        const found = findAttachmentPart(child);
        if (found) return found;
    }
    return null;
}

export async function checkPendingSupplierEmails(user, password, knownSuppliers) {
    if (!knownSuppliers || knownSuppliers.length === 0) return [];

    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const uids = await client.search({ seen: false }, { uid: true });
        const pending = [];
        if (uids.length > 0) {
            for await (const msg of client.fetch(uids, { envelope: true, bodyStructure: true }, { uid: true })) {
                const from = msg.envelope.from?.[0]?.address ?? '';
                const supplier = matchSupplier(from, knownSuppliers);
                if (supplier) {
                    pending.push({
                        uid: msg.uid,
                        subject: msg.envelope.subject ?? '',
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
