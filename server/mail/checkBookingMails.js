import { ImapFlow } from 'imapflow';

const BOOKING_DOMAIN = 'booking.com';
const RELEVANT_SUBJECTS = ['nueva reserva', 'reserva cancelada', 'reserva modificada'];

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

export async function checkPendingBookingEmails(user, password) {
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const uids = await client.search({ seen: false }, { uid: true });
        const pending = [];
        if (uids.length > 0) {
            for await (const msg of client.fetch(uids, { envelope: true }, { uid: true })) {
                const from = msg.envelope.from?.[0]?.address ?? '';
                const subject = msg.envelope.subject ?? '';
                const subjectLower = subject.toLowerCase();
                const isRelevant = from.includes(BOOKING_DOMAIN) &&
                    RELEVANT_SUBJECTS.some(kw => subjectLower.includes(kw));
                if (isRelevant) {
                    pending.push({
                        uid: msg.uid,
                        subject,
                        from,
                        date: msg.envelope.date,
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

export async function markBookingEmailsRead(user, password) {
    const client = await getClient(user, password);
    const lock = await client.getMailboxLock('INBOX');
    try {
        const uids = await client.search({ seen: false }, { uid: true });
        const bookingUids = [];
        for await (const msg of client.fetch(uids, { envelope: true }, { uid: true })) {
            const from = msg.envelope.from?.[0]?.address ?? '';
            const subject = (msg.envelope.subject ?? '').toLowerCase();
            const isRelevant = from.includes(BOOKING_DOMAIN) &&
                RELEVANT_SUBJECTS.some(kw => subject.includes(kw));
            if (isRelevant) bookingUids.push(msg.uid);
        }
        if (bookingUids.length > 0) {
            await client.messageFlagsAdd(bookingUids, ['\\Seen'], { uid: true });
        }
        return bookingUids.length;
    } finally {
        lock.release();
        await client.logout();
    }
}
