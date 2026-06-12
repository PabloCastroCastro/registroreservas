export type Municipio = { codigo: string; municipio: string };

function normalize(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quitar tildes/diacríticos
        .replace(/[^a-z0-9 ]/g, ' ')    // reemplazar caracteres especiales por espacio
        .replace(/\s+/g, ' ')
        .trim();
}

function wordSet(s: string): Set<string> {
    return new Set(normalize(s).split(' ').filter(w => w.length >= 3));
}

/**
 * Busca el municipio cuyo nombre más se aproxima al texto OCR.
 * Usa similitud de Jaccard sobre palabras normalizadas (sin tildes, minúsculas).
 * Ejemplos: "A CORUÑA" → "a coruna" → A Coruña (15030)
 *           "MALPICA DE BERGANTINOS" → Malpica de Bergantiños (15043)
 * Devuelve null si la mejor puntuación es < 0.5.
 */
export function findMunicipioByName(
    text: string,
    municipios: Municipio[]
): Municipio | null {
    if (!text?.trim() || !municipios.length) return null;

    const normText = normalize(text);

    // Coincidencia exacta (rápida)
    const exact = municipios.find(m => normalize(m.municipio) === normText);
    if (exact) return exact;

    const textWords = wordSet(text);
    if (textWords.size === 0) return null;

    let best: Municipio | null = null;
    let bestScore = 0;

    for (const m of municipios) {
        const mWords = wordSet(m.municipio);
        if (mWords.size === 0) continue;

        const intersection = Array.from(textWords).filter(w => mWords.has(w)).length;
        if (intersection === 0) continue;

        const union = new Set(Array.from(textWords).concat(Array.from(mWords))).size;
        const score = intersection / union;

        if (score > bestScore) {
            bestScore = score;
            best = m;
        }
    }

    return bestScore >= 0.5 ? best : null;
}
