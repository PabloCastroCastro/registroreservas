const EMAIL_FORMAT = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Dominios habituales usados para detectar erratas (lista estática, sin resolución DNS).
const KNOWN_DOMAINS = [
    'gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es',
    'yahoo.com', 'yahoo.es', 'icloud.com', 'live.com', 'msn.com', 'aol.com',
    'protonmail.com', 'terra.es', 'telefonica.net', 'movistar.es', 'wanadoo.es',
];

export function isValidEmailFormat(email: string): boolean {
    return EMAIL_FORMAT.test(email.trim());
}

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

// Si el dominio se parece mucho a uno conocido pero no coincide, sugiere la corrección
// (p.ej. "user@gmial.com" -> "user@gmail.com"). No bloquea dominios propios/desconocidos.
export function suggestEmailCorrection(email: string): string | null {
    const at = email.lastIndexOf('@');
    if (at === -1) return null;
    const domain = email.slice(at + 1).toLowerCase().trim();
    if (!domain || KNOWN_DOMAINS.includes(domain)) return null;

    let best: { domain: string; distance: number } | null = null;
    for (const known of KNOWN_DOMAINS) {
        const distance = levenshtein(domain, known);
        if (distance > 0 && distance <= 2 && (!best || distance < best.distance)) {
            best = { domain: known, distance };
        }
    }
    return best ? `${email.slice(0, at + 1)}${best.domain}` : null;
}
