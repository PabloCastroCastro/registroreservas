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

export async function checkPendingSupplierEmails(user, password, knownSuppliers) {
    if (!knownSuppliers || knownSuppliers.length === 0) return [];

    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const uids = await client.search({ seen: false }, { uid: true });
        const pending = [];
        if (uids.length > 0) {
            for await (const msg of client.fetch(uids, { envelope: true }, { uid: true })) {
                const from = msg.envelope.from?.[0]?.address ?? '';
                const supplier = matchSupplier(from, knownSuppliers);
                if (supplier) {
                    pending.push({
                        uid: msg.uid,
                        subject: msg.envelope.subject ?? '',
                        from,
                        date: msg.envelope.date,
                        supplierName: supplier.name,
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
