import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE } from "../config/api.js";
import { buscarRotaPorEnderecos } from "../services/rotaService";
import { registrarHistorico, TIPO_ACAO, ENTIDADE_AFETADA } from "../services/historicoService";
import { useCorridaEmAndamento } from "../contexts/CorridaEmAndamentoContext.jsx";

// Ícones padrão do Leaflet quebram com bundlers; usar ícones explícitos
const iconePadrao = (cor) =>
    new L.DivIcon({
        className: "marker-custom",
        html: `<div style="background:${cor};width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

const iconeCarro = new L.DivIcon({
    className: "marker-carro",
    html: `<div style="background:#2563eb;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">🚗</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const ICONE_ORIGEM = iconePadrao("#22c55e");
const ICONE_DESTINO = iconePadrao("#ef4444");

/** Ajusta o mapa para mostrar todos os pontos (rota + marcadores). */
function AjustarBounds({ pontos }) {
    const map = useMap();
    useEffect(() => {
        if (!pontos || pontos.length === 0) return;
        const bounds = L.latLngBounds(pontos);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }, [map, pontos]);
    return null;
}

/** Formata duração em milissegundos para "X min Y s". */
function formatarDuracao(ms) {
    const segundos = Math.floor(ms / 1000);
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    if (min > 0) return `${min} min ${seg} s`;
    return `${seg} s`;
}

const DURACAO_MS = 30000;
const PASSO_MS = 100;

/** Registra pausa/retomada no histórico enviando apenas Strings (tipoAcao, entidadeAfetada, descricao). */
function registrarHistoricoCorrida(tipoAcao, corridaId, embedInModal) {
    const origem = embedInModal ? "janela flutuante" : "página Rota";
    const descricao = corridaId != null ? `corridaId=${corridaId} (${origem})` : origem;
    const tipoAcaoStr = tipoAcao === "RETOMAR" ? TIPO_ACAO.RETOMAR : TIPO_ACAO.PAUSAR;
    registrarHistorico(tipoAcaoStr, ENTIDADE_AFETADA.CORRIDA, descricao);
}

export default function MapaRotaComponent({
    initialEnderecoOrigem = "",
    initialEnderecoDestino = "",
    corridaId = null,
    embedInModal = false,
    onFinalizar = null,
    /** Quando true, apenas traça e exibe a rota no mapa, sem iniciar/finalizar corrida (ex.: página Rota da Corrida). */
    somenteRota = false,
}) {
    const navigate = useNavigate();
    const ctx = useCorridaEmAndamento();
    const useGlobalState = !somenteRota &&
        corridaId != null &&
        ctx?.corridaEmAndamentoId === corridaId &&
        ctx?.activeCorrida != null;

    const [enderecoOrigem, setEnderecoOrigem] = useState(initialEnderecoOrigem || "");
    const [enderecoDestino, setEnderecoDestino] = useState(initialEnderecoDestino || "");
    const [origem, setOrigem] = useState(null);
    const [destino, setDestino] = useState(null);
    const [rota, setRota] = useState(null);
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [posicaoCarro, setPosicaoCarro] = useState(null);
    const [corridaRodando, setCorridaRodando] = useState(false);
    const [corridaPausada, setCorridaPausada] = useState(false);
    const [modalFinalizada, setModalFinalizada] = useState(false);
    const [tempoCorridaMs, setTempoCorridaMs] = useState(0);
    const [finalizando, setFinalizando] = useState(false);
    const intervaloRef = useRef(null);
    const inicioCorridaRef = useRef(null);
    const progressRef = useRef(0);
    const jaTracouComEstadoRef = useRef(false);
    const jaIniciouAutomaticamenteRef = useRef(false);

    const ac = ctx?.activeCorrida;
    const origemD = useGlobalState && ac ? ac.origem : origem;
    const destinoD = useGlobalState && ac ? ac.destino : destino;
    const rotaD = useGlobalState && ac ? ac.rota : rota;
    const posicaoCarroD = useGlobalState && ac ? ac.posicaoCarro : posicaoCarro;
    const corridaRodandoD = useGlobalState && ac ? ac.corridaRodando : corridaRodando;
    const corridaPausadaD = useGlobalState && ac ? ac.corridaPausada : corridaPausada;
    const modalFinalizadaD = useGlobalState && ac ? ac.showModalFinalizada : modalFinalizada;
    const tempoCorridaMsD = useGlobalState && ac ? ac.tempoCorridaMs : tempoCorridaMs;
    const carregandoD = useGlobalState && ac ? ac.carregando : carregando;
    const erroD = useGlobalState && ac ? ac.erro : erro;

    const limparRota = useCallback(() => {
        setOrigem(null);
        setDestino(null);
        setRota(null);
        setPosicaoCarro(null);
        setCorridaRodando(false);
        setCorridaPausada(false);
        setErro(null);
        progressRef.current = 0;
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
            intervaloRef.current = null;
        }
    }, []);

    const tracarRota = async () => {
        setErro(null);
        setCarregando(true);
        limparRota();
        try {
            const { origem: o, destino: d, rota: r } = await buscarRotaPorEnderecos(enderecoOrigem, enderecoDestino);
            setOrigem(o);
            setDestino(d);
            setRota(r);
        } catch (e) {
            setErro(e.message || "Erro ao traçar rota.");
        } finally {
            setCarregando(false);
        }
    };

    // Quando veio da lista de corridas (estado da navegação), preenche e traça a rota automaticamente (apenas se não for corrida global)
    useEffect(() => {
        if (corridaId != null) return;
        if (jaTracouComEstadoRef.current) return;
        const orig = (initialEnderecoOrigem || "").trim();
        const dest = (initialEnderecoDestino || "").trim();
        if (!orig || !dest) return;
        jaTracouComEstadoRef.current = true;
        setEnderecoOrigem(orig);
        setEnderecoDestino(dest);
        setErro(null);
        setCarregando(true);
        limparRota();
        buscarRotaPorEnderecos(orig, dest)
            .then(({ origem: o, destino: d, rota: r }) => {
                setOrigem(o);
                setDestino(d);
                setRota(r);
            })
            .catch((e) => {
                setErro(e.message || "Erro ao traçar rota.");
            })
            .finally(() => setCarregando(false));
    }, [initialEnderecoOrigem, initialEnderecoDestino]);

    /** Inicia ou retoma a animação a partir de um passo (0 = do início). */
    const runAnimation = useCallback((initialStep) => {
        if (!rota || rota.length === 0) return;
        if (intervaloRef.current) return;
        const totalPassos = DURACAO_MS / PASSO_MS;
        const pontos = rota;
        progressRef.current = initialStep;
        if (initialStep === 0) {
            inicioCorridaRef.current = Date.now();
            setPosicaoCarro(pontos[0]);
        }
        setCorridaRodando(true);
        setCorridaPausada(false);

        const id = setInterval(() => {
            const passoAtual = progressRef.current;
            progressRef.current += 1;
            const t = Math.min(1, passoAtual / totalPassos);
            const indice = Math.min(Math.floor(t * (pontos.length - 1)), pontos.length - 1);
            const proximoIndice = Math.min(indice + 1, pontos.length - 1);
            const frac = t * (pontos.length - 1) - indice;
            const p1 = pontos[indice];
            const p2 = pontos[proximoIndice];
            const lat = p1[0] + (p2[0] - p1[0]) * frac;
            const lng = p1[1] + (p2[1] - p1[1]) * frac;
            setPosicaoCarro([lat, lng]);
            if (passoAtual >= totalPassos) {
                clearInterval(id);
                intervaloRef.current = null;
                setCorridaRodando(false);
                setPosicaoCarro(pontos[pontos.length - 1]);
                const tempoMs = inicioCorridaRef.current ? Date.now() - inicioCorridaRef.current : DURACAO_MS;
                setTempoCorridaMs(tempoMs);
                setModalFinalizada(true);
            }
        }, PASSO_MS);
        intervaloRef.current = id;
    }, [rota]);

    // Ao vir da lista (corridaId definido), após a rota ser traçada, inicia a corrida automaticamente (apenas modo local; corrida global é iniciada no contexto). Não auto-inicia em modo somente rota.
    useEffect(() => {
        if (somenteRota) return;
        if (corridaId != null) return;
        if (!rota || rota.length === 0) return;
        if (jaIniciouAutomaticamenteRef.current) return;
        if (intervaloRef.current) return;
        jaIniciouAutomaticamenteRef.current = true;
        runAnimation(0);
    }, [somenteRota, corridaId, rota, runAnimation]);

    const iniciarCorrida = useCallback(() => {
        if (!rota || rota.length === 0) return;
        if (intervaloRef.current) return;
        runAnimation(0);
    }, [rota, runAnimation]);

    const pausarCorrida = useCallback(() => {
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
            intervaloRef.current = null;
        }
        setCorridaRodando(false);
        setCorridaPausada(true);
        registrarHistoricoCorrida("PAUSAR", corridaId, embedInModal);
    }, [corridaId, embedInModal]);

    const retomarCorrida = useCallback(() => {
        runAnimation(progressRef.current);
        registrarHistoricoCorrida("RETOMAR", corridaId, embedInModal);
    }, [runAnimation, corridaId, embedInModal]);

    const fecharModalOk = useCallback(() => {
        setModalFinalizada(false);
        if (corridaId != null) {
            setFinalizando(true);
            fetch(`${API_BASE}/corridas/editarCorrida/${corridaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statusCorrida: "FINALIZADA" }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Erro ao finalizar.");
                    if (onFinalizar) onFinalizar();
                    else navigate("/listarTodosCorridas", { replace: true });
                })
                .catch(() => setErro("Erro ao finalizar corrida no servidor."))
                .finally(() => setFinalizando(false));
        } else {
            if (onFinalizar) onFinalizar();
            else navigate("/listarTodosCorridas", { replace: true });
        }
    }, [corridaId, navigate, onFinalizar]);

    useEffect(() => {
        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current);
        };
    }, []);

    const todosPontos = [
        ...(origemD ? [origemD] : []),
        ...(destinoD ? [destinoD] : []),
        ...(rotaD || []),
    ];

    const centro = origemD && destinoD
        ? [(origemD[0] + destinoD[0]) / 2, (origemD[1] + destinoD[1]) / 2]
        : [-23.5505, -46.6333];

    const handlePausar = useGlobalState ? (ctx?.pausarCorridaGlobal) : pausarCorrida;
    const handleRetomar = useGlobalState ? (ctx?.retomarCorridaGlobal) : retomarCorrida;
    const handleFinalizarAgora = ctx?.finalizarAgora;

    return (
        <div className="container-fluid p-0 d-flex flex-column flex-grow-1">
            {!embedInModal && (
                <div className="row g-2 p-3 bg-light rounded shadow-sm mb-3">
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Endereço inicial</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ex: Rua Augusta, 1000, São Paulo, SP"
                            value={enderecoOrigem}
                            onChange={(e) => setEnderecoOrigem(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Endereço final</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ex: Av. Paulista, 1000, São Paulo, SP"
                            value={enderecoDestino}
                            onChange={(e) => setEnderecoDestino(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 d-flex flex-column justify-content-end gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={tracarRota}
                                disabled={carregando || !enderecoOrigem.trim() || !enderecoDestino.trim()}
                            >
                                {carregando ? "Carregando..." : "Traçar rota"}
                            </button>
                            {rotaD && rotaD.length > 0 && (
                                <>
                                    {!somenteRota && !corridaRodandoD && !corridaPausadaD && !useGlobalState && (
                                        <button type="button" className="btn btn-success" onClick={iniciarCorrida}>
                                            Iniciar corrida
                                        </button>
                                    )}
                                    {!somenteRota && corridaRodandoD && (
                                        <button type="button" className="btn btn-warning" onClick={handlePausar}>
                                            Pausar
                                        </button>
                                    )}
                                    {!somenteRota && corridaPausadaD && (
                                        <button type="button" className="btn btn-success" onClick={handleRetomar}>
                                            Retomar
                                        </button>
                                    )}
                                    {!somenteRota && (corridaRodandoD || corridaPausadaD) && useGlobalState && handleFinalizarAgora && (
                                        <button type="button" className="btn btn-primary" onClick={handleFinalizarAgora}>
                                            Finalizar
                                        </button>
                                    )}
                                    {(!useGlobalState || somenteRota) && (
                                        <button type="button" className="btn btn-outline-secondary" onClick={limparRota}>
                                            Limpar
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {embedInModal && !somenteRota && rotaD && rotaD.length > 0 && (
                <div className="d-flex gap-2 flex-wrap p-2 bg-light border-bottom">
                    {!corridaRodandoD && !corridaPausadaD && !useGlobalState && (
                        <button type="button" className="btn btn-success btn-sm" onClick={iniciarCorrida}>
                            Iniciar corrida
                        </button>
                    )}
                    {corridaRodandoD && (
                        <button type="button" className="btn btn-warning btn-sm" onClick={handlePausar}>
                            Pausar
                        </button>
                    )}
                    {corridaPausadaD && (
                        <button type="button" className="btn btn-success btn-sm" onClick={handleRetomar}>
                            Retomar
                        </button>
                    )}
                    {(corridaRodandoD || corridaPausadaD) && handleFinalizarAgora && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleFinalizarAgora}>
                            Finalizar
                        </button>
                    )}
                    {!useGlobalState && (
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={limparRota}>
                            Limpar
                        </button>
                    )}
                    {(corridaRodandoD || corridaPausadaD) && (
                        <span className="align-self-center small text-muted">
                            {corridaRodandoD ? "Corrida em andamento..." : "Corrida pausada"}
                        </span>
                    )}
                </div>
            )}

            {erroD && (
                <div className="alert alert-danger mx-3" role="alert">
                    {erroD}
                </div>
            )}

            <div
                className="rounded overflow-hidden shadow-sm border flex-grow-1 position-relative"
                style={embedInModal ? { minHeight: "400px", height: "100%", flex: 1 } : { height: "calc(100vh - 220px)", minHeight: "400px" }}
            >
                {embedInModal && carregandoD && (
                    <div
                        className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-white bg-opacity-90"
                        style={{ zIndex: 1000 }}
                    >
                        <span className="fw-semibold text-primary">Carregando...</span>
                    </div>
                )}
                <MapContainer
                    center={centro}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {todosPontos.length > 0 && <AjustarBounds pontos={todosPontos} />}
                    {rotaD && rotaD.length > 0 && (
                        <Polyline positions={rotaD} pathOptions={{ color: "#3b82f6", weight: 5 }} />
                    )}
                    {origemD && <Marker position={origemD} icon={ICONE_ORIGEM} />}
                    {destinoD && <Marker position={destinoD} icon={ICONE_DESTINO} />}
                    {posicaoCarroD && <Marker position={posicaoCarroD} icon={iconeCarro} />}
                </MapContainer>
            </div>

            {rotaD && (
                <div className="mt-2 px-3 text-muted small">
                    <span className="badge bg-success me-2">● Origem</span>
                    <span className="badge bg-danger me-2">● Destino</span>
                    {!somenteRota && <span className="badge bg-primary">🚗 Posição do veículo</span>}
                    {!somenteRota && corridaRodandoD && <span className="ms-2 fw-semibold text-primary">Corrida em andamento...</span>}
                </div>
            )}

            {modalFinalizadaD && !useGlobalState && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modalFinalizadaLabel"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalFinalizadaLabel">
                                    Corrida finalizada
                                </h5>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">
                                    Tempo da corrida: <strong>{formatarDuracao(tempoCorridaMsD)}</strong>
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={fecharModalOk}
                                    disabled={finalizando}
                                >
                                    {finalizando ? "Finalizando..." : "Ok"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
