import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";
import { API_BASE } from "../config/api.js";
import { buscarRotaPorEnderecos } from "../services/rotaService.js";
import { registrarHistorico } from "../services/historicoService.js";

const TIPO_ACAO = { PAUSAR: "PAUSAR", RETOMAR: "RETOMAR" };
const ENTIDADE_AFETADA = { CORRIDA: "CORRIDA" };

const DURACAO_MS = 30000;
const PASSO_MS = 100;

function formatarDuracao(ms) {
    const segundos = Math.floor(ms / 1000);
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    if (min > 0) return `${min} min ${seg} s`;
    return `${seg} s`;
}

const CorridaEmAndamentoContext = createContext(null);

export function useCorridaEmAndamento() {
    const ctx = useContext(CorridaEmAndamentoContext);
    if (!ctx)
        throw new Error(
            "useCorridaEmAndamento must be used within CorridaEmAndamentoProvider"
        );
    return ctx;
}

/**
 * Estado da corrida em andamento (global). Quando definido, a animação roda no provider
 * independente da página ou da janela flutuante.
 * @type {{ corridaId, enderecoOrigem, enderecoDestino, onFinalizar, rota, origem, destino, posicaoCarro, corridaRodando, corridaPausada, showModalFinalizada, tempoCorridaMs, carregando, erro } | null}
 */
function estadoInicialCorrida(data) {
    if (!data) return null;
    return {
        corridaId: data.corridaId ?? null,
        enderecoOrigem: data.enderecoOrigem ?? "",
        enderecoDestino: data.enderecoDestino ?? "",
        onFinalizar: data.onFinalizar ?? null,
        rota: null,
        origem: null,
        destino: null,
        posicaoCarro: null,
        corridaRodando: false,
        corridaPausada: false,
        showModalFinalizada: false,
        tempoCorridaMs: 0,
        carregando: false,
        erro: null,
    };
}

export function CorridaEmAndamentoProvider({ children }) {
    const [activeCorrida, setActiveCorrida] = useState(null);
    const [showJanelaFlutuante, setShowJanelaFlutuante] = useState(false);

    const intervaloRef = useRef(null);
    const progressRef = useRef(0);
    const inicioCorridaRef = useRef(null);

    const updateActiveCorrida = useCallback((updates) => {
        setActiveCorrida((prev) => (prev ? { ...prev, ...updates } : null));
    }, []);

    const limparIntervalo = useCallback(() => {
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
            intervaloRef.current = null;
        }
    }, []);

    const iniciarRunner = useCallback(
        (pontos) => {
            if (!pontos || pontos.length === 0) return;
            if (intervaloRef.current) return;
            const totalPassos = DURACAO_MS / PASSO_MS;
            progressRef.current = 0;
            inicioCorridaRef.current = Date.now();
            updateActiveCorrida({
                posicaoCarro: pontos[0],
                corridaRodando: true,
                corridaPausada: false,
            });

            const id = setInterval(() => {
                const passoAtual = progressRef.current;
                progressRef.current += 1;
                const t = Math.min(1, passoAtual / totalPassos);
                const indice = Math.min(
                    Math.floor(t * (pontos.length - 1)),
                    pontos.length - 1
                );
                const proximoIndice = Math.min(indice + 1, pontos.length - 1);
                const frac = t * (pontos.length - 1) - indice;
                const p1 = pontos[indice];
                const p2 = pontos[proximoIndice];
                const lat = p1[0] + (p2[0] - p1[0]) * frac;
                const lng = p1[1] + (p2[1] - p1[1]) * frac;
                setActiveCorrida((prev) =>
                    prev ? { ...prev, posicaoCarro: [lat, lng] } : null
                );
                if (passoAtual >= totalPassos) {
                    clearInterval(id);
                    intervaloRef.current = null;
                    const tempoMs = inicioCorridaRef.current
                        ? Date.now() - inicioCorridaRef.current
                        : DURACAO_MS;
                    setActiveCorrida((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  corridaRodando: false,
                                  posicaoCarro: pontos[pontos.length - 1],
                                  showModalFinalizada: true,
                                  tempoCorridaMs: tempoMs,
                              }
                            : null
                    );
                }
            }, PASSO_MS);
            intervaloRef.current = id;
        },
        [updateActiveCorrida]
    );

    // Buscar rota e iniciar corrida quando activeCorrida tem corridaId e endereços mas rota ainda não
    useEffect(() => {
        if (
            !activeCorrida ||
            !activeCorrida.corridaId ||
            !activeCorrida.enderecoOrigem?.trim() ||
            !activeCorrida.enderecoDestino?.trim() ||
            activeCorrida.rota
        ) {
            return;
        }
        updateActiveCorrida({ carregando: true, erro: null });
        buscarRotaPorEnderecos(
            activeCorrida.enderecoOrigem,
            activeCorrida.enderecoDestino
        )
            .then(({ origem: o, destino: d, rota: r }) => {
                setActiveCorrida((prev) =>
                    prev
                        ? {
                              ...prev,
                              rota: r,
                              origem: o,
                              destino: d,
                              carregando: false,
                              erro: null,
                          }
                        : null
                );
                if (r && r.length > 0) {
                    iniciarRunner(r);
                }
            })
            .catch((e) => {
                updateActiveCorrida({
                    carregando: false,
                    erro: e.message || "Erro ao traçar rota.",
                });
            });
    }, [
        activeCorrida?.corridaId,
        activeCorrida?.enderecoOrigem,
        activeCorrida?.enderecoDestino,
        activeCorrida?.rota,
        updateActiveCorrida,
        iniciarRunner,
    ]);

    const pausarCorridaGlobal = useCallback(() => {
        limparIntervalo();
        updateActiveCorrida({ corridaRodando: false, corridaPausada: true });
        const c = activeCorrida;
        if (c?.corridaId) {
            const desc =
                "corridaId=" + c.corridaId + " (global)";
            registrarHistorico(
                TIPO_ACAO.PAUSAR,
                ENTIDADE_AFETADA.CORRIDA,
                desc
            );
        }
    }, [activeCorrida, limparIntervalo, updateActiveCorrida]);

    const retomarCorridaGlobal = useCallback(() => {
        if (!activeCorrida?.rota || activeCorrida.rota.length === 0) return;
        const pontos = activeCorrida.rota;
        const totalPassos = DURACAO_MS / PASSO_MS;
        const passoAtual = progressRef.current;
        if (passoAtual >= totalPassos) return;
        const id = setInterval(() => {
            const p = progressRef.current;
            progressRef.current += 1;
            const t = Math.min(1, p / totalPassos);
            const indice = Math.min(
                Math.floor(t * (pontos.length - 1)),
                pontos.length - 1
            );
            const proximoIndice = Math.min(indice + 1, pontos.length - 1);
            const frac = t * (pontos.length - 1) - indice;
            const p1 = pontos[indice];
            const p2 = pontos[proximoIndice];
            const lat = p1[0] + (p2[0] - p1[0]) * frac;
            const lng = p1[1] + (p2[1] - p1[1]) * frac;
            setActiveCorrida((prev) =>
                prev ? { ...prev, posicaoCarro: [lat, lng] } : null
            );
            if (p >= totalPassos) {
                clearInterval(id);
                intervaloRef.current = null;
                const tempoMs = inicioCorridaRef.current
                    ? Date.now() - inicioCorridaRef.current
                    : DURACAO_MS;
                setActiveCorrida((prev) =>
                    prev
                        ? {
                              ...prev,
                              corridaRodando: false,
                              posicaoCarro: pontos[pontos.length - 1],
                              showModalFinalizada: true,
                              tempoCorridaMs: tempoMs,
                          }
                        : null
                );
            }
        }, PASSO_MS);
        intervaloRef.current = id;
        updateActiveCorrida({ corridaRodando: true, corridaPausada: false });
        if (activeCorrida?.corridaId) {
            const desc = "corridaId=" + activeCorrida.corridaId + " (global)";
            registrarHistorico(
                TIPO_ACAO.RETOMAR,
                ENTIDADE_AFETADA.CORRIDA,
                desc
            );
        }
    }, [activeCorrida, updateActiveCorrida]);

    const fecharModalFinalizada = useCallback(() => {
        const c = activeCorrida;
        if (!c) return;
        const corridaId = c.corridaId;
        const onFinalizar = c.onFinalizar;
        limparIntervalo();
        setActiveCorrida(null);
        setShowJanelaFlutuante(false);
        if (corridaId != null) {
            const tempoMs = c.tempoCorridaMs != null ? c.tempoCorridaMs : 0;
            const duracaoSegundos = Math.round(tempoMs / 1000);
            fetch(`${API_BASE}/corridas/editarCorrida/${corridaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statusCorrida: "FINALIZADA", duracaoSegundos }),
            })
                .then((res) => {
                    if (res.ok && onFinalizar) onFinalizar();
                })
                .catch(() => {});
        } else if (onFinalizar) onFinalizar();
    }, [activeCorrida, limparIntervalo]);

    /** Finaliza a corrida agora (para a animação e mostra o modal com o tempo decorrido). Ao clicar Ok no modal, o status é enviado ao backend. */
    const finalizarAgora = useCallback(() => {
        limparIntervalo();
        const ms = inicioCorridaRef.current ? Date.now() - inicioCorridaRef.current : 0;
        updateActiveCorrida({
            corridaRodando: false,
            corridaPausada: false,
            showModalFinalizada: true,
            tempoCorridaMs: ms,
        });
    }, [limparIntervalo, updateActiveCorrida]);

    const openCorridaModal = useCallback((data) => {
        if (!data) return;
        setActiveCorrida((prev) => {
            if (prev && prev.corridaId === data.corridaId) return prev;
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
                intervaloRef.current = null;
            }
            return estadoInicialCorrida(data);
        });
        setShowJanelaFlutuante(true);
    }, []);

    const closeCorridaModal = useCallback(() => {
        setShowJanelaFlutuante(false);
    }, []);

    /** Garante que a corrida está ativa globalmente (ex.: ao entrar na página de rotas com state). Não abre a janela flutuante. */
    const ensureCorridaAtiva = useCallback((data) => {
        if (!data?.corridaId) return;
        setActiveCorrida((prev) => {
            if (prev && prev.corridaId === data.corridaId) return prev;
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
                intervaloRef.current = null;
            }
            return estadoInicialCorrida(data);
        });
    }, []);

    useEffect(() => {
        return () => limparIntervalo();
    }, [limparIntervalo]);

    const value = {
        activeCorrida,
        showJanelaFlutuante,
        openCorridaModal,
        closeCorridaModal,
        ensureCorridaAtiva,
        corridaEmAndamentoId: activeCorrida?.corridaId ?? null,
        updateActiveCorrida,
        pausarCorridaGlobal,
        retomarCorridaGlobal,
        fecharModalFinalizada,
        finalizarAgora,
        progressRef,
        inicioCorridaRef,
    };

    const mostrarModalFinalizada = activeCorrida?.showModalFinalizada && activeCorrida?.tempoCorridaMs != null;

    return (
        <CorridaEmAndamentoContext.Provider value={value}>
            {children}
            {mostrarModalFinalizada && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modalFinalizadaGlobalLabel"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalFinalizadaGlobalLabel">
                                    Corrida finalizada
                                </h5>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">
                                    Tempo da corrida (do início até a finalização):{" "}
                                    <strong>{formatarDuracao(activeCorrida.tempoCorridaMs)}</strong>
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={fecharModalFinalizada}
                                >
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CorridaEmAndamentoContext.Provider>
    );
}
