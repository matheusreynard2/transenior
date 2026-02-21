/**
 * Serviço de registro no histórico. Use este módulo para qualquer tipo de ação
 * que deva ser registrada no histórico (pausar/retomar, etc.).
 * Todas as ações são enviadas com Strings (tipoAcao, entidadeAfetada, descricao),
 * nunca enums. Valores alinhados ao backend Enuns.java.
 */

const API = "http://localhost:8080/v1";

/** Strings para tipoAcao (Enuns.TipoAcao no backend). */
export const TIPO_ACAO = {
  CADASTRO: "CADASTRO",
  ATUALIZACAO: "ATUALIZACAO",
  EXCLUSAO: "EXCLUSAO",
  TROCA_STATUS: "TROCA_STATUS",
  PAUSAR: "PAUSAR",
  RETOMAR: "RETOMAR",
};

/** Strings para entidadeAfetada (Enuns.EntidadeAfetada no backend). */
export const ENTIDADE_AFETADA = {
  MOTORISTA: "MOTORISTA",
  IDOSO: "IDOSO",
  CORRIDA: "CORRIDA",
  RELACIONAMENTO: "RELACIONAMENTO",
  ENDERECO: "ENDERECO",
};

/**
 * Registra uma ação no histórico. Envia request no body: { tipoAcao, entidadeAfetada, descricao }.
 * @param {string} tipoAcao - Ex.: TIPO_ACAO.PAUSAR, TIPO_ACAO.RETOMAR
 * @param {string} entidadeAfetada - Ex.: ENTIDADE_AFETADA.CORRIDA
 * @param {string} descricao - Descrição livre da ação
 */
export function registrarHistorico(tipoAcao, entidadeAfetada, descricao) {
  const body = {
    tipoAcao: String(tipoAcao),
    entidadeAfetada: String(entidadeAfetada),
    descricao: descricao != null ? String(descricao) : "",
  };
  fetch(`${API}/historicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
