/**
 * Geocoding e roteamento via backend (proxy Nominatim + OSRM) para evitar CORS no navegador.
 */

const API_ROTA_BASE = "http://localhost:8080/v1/rota";

/**
 * Normaliza endereço para busca no Nominatim (evita rate limit: 1 req/seg).
 * Garante ", Brasil" no final para melhor resultado.
 */
function normalizarEndereco(endereco) {
    const s = String(endereco || "").trim();
    if (!s) return "";
    return s.endsWith("Brasil") ? s : s + ", Brasil";
}

/**
 * Converte endereço em texto para coordenadas [lat, lon]. Envia request no body: { q }.
 * @param {string} endereco - Ex: "Rua Augusta, 1000, São Paulo, SP"
 * @returns {Promise<[number, number]|null>}
 */
export async function geocodificar(endereco) {
    const end = normalizarEndereco(endereco);
    if (!end) return null;
    try {
        const res = await fetch(`${API_ROTA_BASE}/geocodificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ q: end }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !Array.isArray(data) || data.length < 2) return null;
        const lat = Number(data[0]);
        const lon = Number(data[1]);
        if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
        return [lat, lon];
    } catch (e) {
        console.error("Erro ao geocodificar:", e);
        return null;
    }
}

/**
 * Obtém a rota (lista de coordenadas [lat, lon]) entre dois pontos. Envia request no body: { origem, destino } (formato "lat,lon").
 * @param {[number, number]} origem - [lat, lon]
 * @param {[number, number]} destino - [lat, lon]
 * @returns {Promise<[number, number][]|null>} coordenadas da rota ou null
 */
export async function obterRota(origem, destino) {
    if (!origem || !destino || origem.length < 2 || destino.length < 2) return null;
    const [lat1, lon1] = origem;
    const [lat2, lon2] = destino;
    const origemStr = `${lat1},${lon1}`;
    const destinoStr = `${lat2},${lon2}`;
    try {
        const res = await fetch(`${API_ROTA_BASE}/roteamento`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ origem: origemStr, destino: destinoStr }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !Array.isArray(data)) return null;
        return data.map((p) => (Array.isArray(p) ? [Number(p[0]), Number(p[1])] : null)).filter(Boolean);
    } catch (e) {
        console.error("Erro ao obter rota:", e);
        return null;
    }
}

/** Pequena pausa para respeitar limite do Nominatim (1 req/seg). */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Dado endereço origem e destino (texto), retorna { origem, destino, rota }
 * com coordenadas e array de pontos da rota. Geocoding em sequência para evitar rate limit.
 */
export async function buscarRotaPorEnderecos(enderecoOrigem, enderecoDestino) {
    const endOrigem = normalizarEndereco(enderecoOrigem);
    const endDestino = normalizarEndereco(enderecoDestino);
    if (!endOrigem) throw new Error("Endereço de origem não informado.");
    if (!endDestino) throw new Error("Endereço de destino não informado.");

    const origem = await geocodificar(endOrigem);
    if (!origem) throw new Error("Não foi possível encontrar o endereço de origem. Tente incluir cidade e estado (ex: São Paulo, SP).");
    await delay(1100);
    const destino = await geocodificar(endDestino);
    if (!destino) throw new Error("Não foi possível encontrar o endereço de destino. Tente incluir cidade e estado (ex: São Paulo, SP).");

    const rota = await obterRota(origem, destino);
    if (!rota || rota.length === 0) throw new Error("Não foi possível traçar a rota entre os endereços.");
    return { origem, destino, rota };
}
