/**
 * Serviço de corridas. PUT de atualização alinhado ao backend (CorridaController, CorridaService).
 * Todas as requisições usam o mesmo base URL e Content-Type.
 */

const API = "http://localhost:8080/v1";

/** Strings para statusCorrida (Enuns.StatusCorrida no backend). */
export const STATUS_CORRIDA = {
  SOLICITADA: "SOLICITADA",
  ACEITA: "ACEITA",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  FINALIZADA: "FINALIZADA",
  CANCELADA: "CANCELADA",
};

/**
 * Atualiza uma corrida (PUT). body pode ser parcial (ex.: apenas { statusCorrida }).
 * @param {number} id - Id da corrida
 * @param {object} body - Objeto com os campos a atualizar (ex.: { statusCorrida: STATUS_CORRIDA.EM_ANDAMENTO })
 * @returns {Promise<Response>}
 */
export const editarCorrida = (id, body) => {
  return fetch(`${API}/corridas/editarCorrida/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export { API as API_BASE };
