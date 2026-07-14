import { ImapFlow } from 'imapflow';

// Por debajo del timeout de nginx (60s) para que, si el correo va lento o no responde,
// el backend falle rápido con un error claro en vez de dejar la petición colgada hasta
// que nginx corte la conexión con un 504 -- que además no deshace lo que ya se haya
// guardado en BD, pudiendo dar lugar a duplicados si el usuario reintenta.
const IMAP_CONNECTION_TIMEOUT = 15000;
const IMAP_SOCKET_TIMEOUT = 30000;

async function getClient(user, password) {
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: { user, pass: password },
        logger: false,
        connectionTimeout: IMAP_CONNECTION_TIMEOUT,
        greetingTimeout: IMAP_CONNECTION_TIMEOUT,
        socketTimeout: IMAP_SOCKET_TIMEOUT,
    });
    await client.connect();
    return client;
}

// Los filtros de Gmail pueden etiquetar y archivar (saltar la bandeja de entrada) los
// correos de proveedores, con lo que dejan de estar en INBOX. "Todos" (\All) los incluye
// a todos (salvo Spam/Papelera) independientemente de en qué etiqueta estén.
async function getSearchMailboxPath(client) {
    const mailboxes = await client.list();
    const allMail = mailboxes.find(m => m.specialUse === '\\All');
    return allMail?.path ?? 'INBOX';
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

    // ImapFlow ya expone node.type como "type/subtype" combinado (p.ej. "multipart/mixed",
    // "application/pdf") -- no existen campos separados type/subtype.
    const type = (node.type ?? '').toLowerCase();
    const filename = node.dispositionParameters?.filename ?? node.parameters?.name;
    const extension = filename?.split('.').pop()?.toLowerCase();
    const isAttachment = node.disposition === 'attachment' || !!filename;
    const isDoc = type === 'application/pdf' || type.startsWith('image/') || DOC_EXTENSIONS.includes(extension ?? '');

    if (isAttachment && isDoc) {
        return { part: node.part, filename: filename ?? `factura.${type.split('/')[1] ?? 'pdf'}`, contentType: type };
    }

    for (const child of node.childNodes ?? []) {
        const found = findAttachmentPart(child);
        if (found) return found;
    }
    return null;
}

const SEARCH_WINDOW_DAYS = 90;

export async function checkPendingSupplierEmails(user, password, knownSuppliers, excludeUids = []) {
    if (!knownSuppliers || knownSuppliers.length === 0) return [];

    const excluded = new Set(excludeUids);
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock(await getSearchMailboxPath(client));
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
                        supplierId: supplier.id,
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
    const lock = await client.getMailboxLock(await getSearchMailboxPath(client));
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
    const lock = await client.getMailboxLock(await getSearchMailboxPath(client));
    try {
        await client.messageFlagsAdd([uid], ['\\Seen'], { uid: true });
    } finally {
        lock.release();
        await client.logout();
    }
}
