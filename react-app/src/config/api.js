/**
 * Base URL da API backend. Deve bater com os controllers em /v1/*.
 * Reinicie o backend (transenior) após alterar rotas.
 */
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/v1";

export default API_BASE;
