import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { Corrida, RelacionamentoMotoristaIdoso } from "../interfaces/Corrida";
import { useCorridaEmAndamento } from "../contexts/CorridaEmAndamentoContext.jsx";
import { estados, fetchCidades, enderecoVazio, enderecoParaPayload, EnderecoForm } from "../interfaces/endereco.ts";
import axios from "axios";

/** PUT para atualizar corrida (status ou corpo completo). */
function putEditarCorrida(id: number, body: object): Promise<Response> {
    return fetch(`${API_BASE}/corridas/editarCorrida/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

/** Extrai string de um campo que pode ser string ou objeto com .nome (ex: cidade do backend). */
const strOuNome = (v: unknown): string => {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "object" && v !== null && "nome" in v && typeof (v as { nome: unknown }).nome === "string") return (v as { nome: string }).nome.trim();
    return String(v).trim();
};

/** Monta uma string de endereço para geocoding a partir do endereço da corrida. Inclui ", Brasil" para Nominatim. */
const enderecoParaTexto = (e: EnderecoForm | null | undefined): string => {
    if (!e) return "";
    const logradouro = strOuNome(e.logradouro);
    const numero = strOuNome(e.numero);
    const cidade = strOuNome(e.cidade);
    const estado = strOuNome(e.estado);
    const partes = [logradouro, numero, cidade, estado].filter(Boolean);
    const base = partes.join(", ");
    if (!base) return "";
    return base.endsWith("Brasil") ? base : base + ", Brasil";
};

const formatEndereco = (logradouro?: string, numero?: string, cidade?: string) => {
    const partes = [logradouro, numero, cidade].filter(Boolean);
    return partes.length ? partes.join(", ") : "-";
};

const statusBadgeClass = (status?: string) => {
    switch (status) {
        case "SOLICITADA":
            return "badge text-bg-warning";
        case "ACEITA":
        case "EM_ANDAMENTO":
            return "badge text-bg-success";
        case "FINALIZADA":
            return "badge text-bg-primary";
        case "CANCELADA":
            return "badge text-bg-danger";
        default:
            return "badge text-bg-secondary";
    }
};

const statusLabel = (status?: string) => {
    if (status === "EM_ANDAMENTO") {
        return "EM ANDAMENTO";
    }
    return status || "-";
};

/** Calcula duração em ms entre duas datas ISO. Retorna 0 se alguma for inválida. */
function duracaoMsEntreIso(isoInicio?: string | null, isoFim?: string | null): number {
    if (!isoInicio || !isoFim) return 0;
    const a = new Date(isoInicio).getTime();
    const b = new Date(isoFim).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return 0;
    return Math.max(0, b - a);
}

function formatarDuracao(ms: number): string {
    if (ms <= 0) return "0 s";
    const segundos = Math.floor(ms / 1000);
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    if (min > 0) return `${min} min ${seg} s`;
    return `${seg} s`;
}

function ListarTodosCorridas() {
    const navigate = useNavigate();
    const { openCorridaModal, corridaEmAndamentoId } = useCorridaEmAndamento();
    const [listaCorridas, setCorridas] = useState<Corrida[]>([]);
    const [relacionamentos, setRelacionamentos] = useState<RelacionamentoMotoristaIdoso[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [editarCorrida, setEditarCorrida] = useState<any>(null);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [msgEdicao, setMsgEdicao] = useState<string | null>(null);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [editOrigemEstado, setEditOrigemEstado] = useState("");
    const [editDestinoEstado, setEditDestinoEstado] = useState("");
    const [editOrigemCidades, setEditOrigemCidades] = useState<{ id: number; nome: string }[]>([]);
    const [editDestinoCidades, setEditDestinoCidades] = useState<{ id: number; nome: string }[]>([]);
    const [listaIdosos, setListaIdosos] = useState<any[]>([]);
    const [listaMotoristas, setListaMotoristas] = useState<any[]>([]);
    const [idExcluirConfirmar, setIdExcluirConfirmar] = useState<number | null>(null);
    const [idsSelecionados, setIdsSelecionados] = useState<Set<number>>(new Set());
    const [excluindoLote, setExcluindoLote] = useState(false);
    const [mostrarConfirmarExcluirLote, setMostrarConfirmarExcluirLote] = useState(false);
    const [excluindoTodas, setExcluindoTodas] = useState(false);
    const [mostrarConfirmarExcluirTodas, setMostrarConfirmarExcluirTodas] = useState(false);
    const [showModalFinalizadaLista, setShowModalFinalizadaLista] = useState(false);
    const [duracaoFinalizadaMs, setDuracaoFinalizadaMs] = useState<number>(0);
    const mostrarCarregando = loading || carregandoEdicao || salvandoEdicao;

    /** Apenas busca corridas e relacionamentos (GET). Use após delete/editar/cancelar para não recriar corridas. */
    const carregarCorridas = () => {
        setLoading(true);
        const urlCorridas = `${API_BASE}/corridas/todasCorridas`;
        const urlRelacionamentos = `${API_BASE}/relacionamentos`;
        Promise.all([
            axios.get(urlCorridas),
            axios.get(urlRelacionamentos),
        ])
            .then(([resCorridas, resRelacionamentos]) => {
                setCorridas(resCorridas.data || []);
                setRelacionamentos(resRelacionamentos.data || []);
            })
            .catch((error) => {
                console.error("Erro ao buscar os itens:", error);
                setMsg("Erro ao carregar dados.");
            })
            .finally(() => setLoading(false));
    };

    /** Retorna o relacionamento motorista-idoso correspondente à corrida, se existir. */
    const relacionamentoDaCorrida = (corrida: Corrida): RelacionamentoMotoristaIdoso | undefined =>
        relacionamentos.find(
            (r) =>
                r.motorista?.id === corrida.motorista?.id && r.idoso?.id === corrida.idoso?.id
        );

    useEffect(() => {
        carregarCorridas();
    }, []);

    useEffect(() => {
        if (!editOrigemEstado) {
            setEditOrigemCidades([]);
            return;
        }
        fetchCidades(editOrigemEstado)
            .then((cidades) => {
                setEditOrigemCidades(cidades);
            })
            .catch(() => {
                setEditOrigemCidades([]);
            });
    }, [editOrigemEstado]);

    useEffect(() => {
        if (!editDestinoEstado) {
            setEditDestinoCidades([]);
            return;
        }
        fetchCidades(editDestinoEstado)
            .then((cidades) => {
                setEditDestinoCidades(cidades);
            })
            .catch(() => {
                setEditDestinoCidades([]);
            });
    }, [editDestinoEstado]);

    if (loading) {
        return <div className="loading-footer">Carregando</div>;
    }

    const executarExclusao = (id: number) => {
        setLoading(true);
        setIdExcluirConfirmar(null);
        fetch(`${API_BASE}/corridas/deletarCorrida/` + id, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 404) setMsg('Corrida não encontrada.');
                    throw new Error('Erro ao excluir corrida.');
                }
                setIdsSelecionados((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                carregarCorridas();
            })
            .catch((error) => {
                setMsg('Erro ao excluir corrida.');
                console.error('Erro ao excluir corrida:', error);
            })
            .finally(() => setLoading(false));
    };

    const toggleSelecao = (id: number) => {
        setIdsSelecionados((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelecionarTodos = () => {
        if (idsSelecionados.size === listaCorridas.length) {
            setIdsSelecionados(new Set());
        } else {
            setIdsSelecionados(new Set(listaCorridas.map((c) => c.id)));
        }
    };

    const abrirConfirmarExcluirLote = () => {
        if (idsSelecionados.size === 0) return;
        setMostrarConfirmarExcluirLote(true);
    };

    const executarExcluirLote = () => {
        const ids = Array.from(idsSelecionados);
        if (ids.length === 0) return;
        setExcluindoLote(true);
        setMsg(null);
        fetch(`${API_BASE}/corridas/deletarCorridas`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 400) setMsg("Nenhuma corrida selecionada.");
                    else setMsg("Erro ao excluir corridas.");
                    throw new Error("Erro ao excluir corridas.");
                }
                setMostrarConfirmarExcluirLote(false);
                setIdsSelecionados(new Set());
                carregarCorridas();
            })
            .catch(() => {})
            .finally(() => setExcluindoLote(false));
    };

    const abrirConfirmarExcluirTodas = () => {
        if (listaCorridas.length === 0) return;
        setMostrarConfirmarExcluirTodas(true);
    };

    const executarExcluirTodas = () => {
        const ids = listaCorridas.map((c) => c.id).filter((id): id is number => id != null);
        if (ids.length === 0) return;
        setExcluindoTodas(true);
        setMsg(null);
        fetch(`${API_BASE}/corridas/deletarCorridas`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })
            .then((response) => {
                if (!response.ok) {
                    setMsg("Erro ao excluir todas as corridas.");
                    throw new Error("Erro ao excluir todas as corridas.");
                }
                setMostrarConfirmarExcluirTodas(false);
                setIdsSelecionados(new Set());
                carregarCorridas();
            })
            .catch(() => {})
            .finally(() => setExcluindoTodas(false));
    };

    const handleFinalizar = (id: number) => {
        setLoading(true);
        setMsg(null);
        putEditarCorrida(id, { statusCorrida: "FINALIZADA", finalizarPelaTabela: true })
            .then(async (response) => {
                if (!response.ok) throw new Error("Erro ao finalizar corrida.");
                const corrida = await response.json();
                const ms = duracaoMsEntreIso(corrida?.dataHoraInicio, corrida?.dataHoraFim);
                setDuracaoFinalizadaMs(ms);
                setShowModalFinalizadaLista(true);
                carregarCorridas();
            })
            .catch(() => setMsg("Erro ao finalizar corrida."))
            .finally(() => setLoading(false));
    };

    /** Aceitar corrida: SOLICITADA → ACEITA. */
    const handleAceitar = (corrida: Corrida) => {
        setLoading(true);
        setMsg(null);
        putEditarCorrida(corrida.id, { statusCorrida: "ACEITA" })
            .then((response) => {
                if (!response.ok) throw new Error("Erro ao aceitar corrida.");
                carregarCorridas();
            })
            .catch(() => setMsg("Erro ao aceitar corrida."))
            .finally(() => setLoading(false));
    };

    /** Iniciar corrida: ACEITA → EM_ANDAMENTO e abre a janela da corrida. */
    const handleIniciar = (corrida: Corrida) => {
        const id = corrida.id;
        const enderecoOrigem = enderecoParaTexto(corrida.origem);
        const enderecoDestino = enderecoParaTexto(corrida.destino);
        if (!enderecoOrigem || !enderecoDestino) {
            setMsg("Esta corrida não possui endereço de origem ou destino. Edite a corrida e preencha os endereços.");
            return;
        }
        setLoading(true);
        setMsg(null);
        putEditarCorrida(id, { statusCorrida: "EM_ANDAMENTO" })
            .then((response) => {
                if (!response.ok) throw new Error("Erro ao iniciar corrida.");
                carregarCorridas();
                openCorridaModal({
                    corridaId: id,
                    enderecoOrigem,
                    enderecoDestino,
                    onFinalizar: carregarCorridas,
                });
            })
            .catch(() => setMsg("Erro ao iniciar corrida."))
            .finally(() => setLoading(false));
    };

    const handleCancelar = (id) => {
        setLoading(true);
        putEditarCorrida(id, { statusCorrida: "CANCELADA" })
            .then((response) => {
                if (!response.ok) throw new Error("Erro ao cancelar corrida.");
                carregarCorridas();
            })
            .catch(() => setMsg("Erro ao cancelar corrida."))
            .finally(() => setLoading(false));
    };

    const abrirEditar = (corrida: Corrida) => {
        setCarregandoEdicao(true);
        setMsgEdicao(null);
        setMostrarEditar(true);
        const copia = JSON.parse(JSON.stringify(corrida));
        setEditarCorrida(copia);
        setEditOrigemEstado(copia?.origem?.estado || "");
        setEditDestinoEstado(copia?.destino?.estado || "");
        Promise.all([
            axios.get(`${API_BASE}/idosos`),
            axios.get(`${API_BASE}/motoristas`),
        ])
            .then(([rIdosos, rMotoristas]) => {
                setListaIdosos(rIdosos.data || []);
                setListaMotoristas(rMotoristas.data || []);
            })
            .catch(() => {
                setListaIdosos([]);
                setListaMotoristas([]);
            })
            .finally(() => setCarregandoEdicao(false));
    };

    const fecharEditar = () => {
        setMostrarEditar(false);
        setEditarCorrida(null);
        setMsgEdicao(null);
        setCarregandoEdicao(false);
        setEditOrigemEstado("");
        setEditDestinoEstado("");
        setEditOrigemCidades([]);
        setEditDestinoCidades([]);
    };

    const salvarEdicao = async () => {
        if (!editarCorrida?.id) {
            return;
        }
        setSalvandoEdicao(true);
        setCarregandoEdicao(true);
        setMsgEdicao(null);
        try {
            const body = {
                idosoId: editarCorrida.idoso?.id ?? null,
                motoristaId: editarCorrida.motorista?.id ?? null,
                origemId: editarCorrida.origem?.id ?? null,
                destinoId: editarCorrida.destino?.id ?? null,
                statusCorrida: editarCorrida.statusCorrida ?? null,
                dataHoraSolicitacao: editarCorrida.dataHoraSolicitacao ?? null,
                dataHoraInicio: editarCorrida.dataHoraInicio ?? null,
                dataHoraFim: editarCorrida.dataHoraFim ?? null,
            };
            const response = await putEditarCorrida(editarCorrida.id, body);
            if (!response.ok) {
                const texto = await response.text();
                setMsgEdicao(texto || "Erro ao salvar edição.");
                return;
            }
            setMsgEdicao(null);
            setMostrarEditar(false);
            carregarCorridas();
        } catch (error) {
            setMsgEdicao("Erro ao salvar edição.");
        } finally {
            setSalvandoEdicao(false);
            setCarregandoEdicao(false);
        }
    };

    return (
        <>
            <div className="container" style={{marginTop: "80px", marginBottom: "20px"}}>
                <h2 className="mb-4" style={{textAlign: "center"}}>Lista de Corridas</h2>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <span className="text-muted small">Corridas existentes no banco. Excluídas não voltam ao reabrir a página.</span>
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={abrirConfirmarExcluirLote}
                            disabled={excluindoLote || idsSelecionados.size === 0 || listaCorridas.length === 0}
                            title="Excluir corridas selecionadas"
                        >
                            {excluindoLote ? "Excluindo..." : `Excluir selecionadas (${idsSelecionados.size})`}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={abrirConfirmarExcluirTodas}
                            disabled={excluindoTodas || listaCorridas.length === 0}
                            title="Excluir todas as corridas"
                        >
                            {excluindoTodas ? "Excluindo..." : "Excluir todas"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => { setLoading(true); carregarCorridas(); }}
                            disabled={loading}
                            title="Recarregar lista de corridas"
                        >
                            Atualizar
                        </button>
                    </div>
                </div>

                {msg && <div className="alert alert-info">{msg}</div>}

                <div className="card p-4 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                        <tr>
                            <th style={{ width: "40px" }}>
                                <input
                                    type="checkbox"
                                    checked={listaCorridas.length > 0 && idsSelecionados.size === listaCorridas.length}
                                    onChange={toggleSelecionarTodos}
                                    title="Selecionar todas"
                                    aria-label="Selecionar todas"
                                />
                            </th>
                            <th>ID</th>
                            <th>Idoso</th>
                            <th>Motorista</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Status</th>
                            <th>Data/Hora</th>
                            <th>Tempo total</th>
                            <th>Ação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {listaCorridas.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={idsSelecionados.has(item.id)}
                                        onChange={() => toggleSelecao(item.id)}
                                        aria-label={`Selecionar corrida ${item.id}`}
                                    />
                                </td>
                                <td>{item.id}</td>
                                <td>{item.idoso?.nome || "-"}</td>
                                <td>{item.motorista?.nome || "-"}</td>
                                <td>{formatEndereco(item.origem?.logradouro, item.origem?.numero, item.origem?.cidade)}</td>
                                <td>{formatEndereco(item.destino?.logradouro, item.destino?.numero, item.destino?.cidade)}</td>
                                <td>
                                    <div className="d-flex flex-column align-items-start gap-1">
                                        <div className="d-flex flex-column gap-2 w-100">
                                            {item.statusCorrida === "EM_ANDAMENTO" && (
                                                <button
                                                    onClick={() => handleFinalizar(item.id)}
                                                    className="btn btn-sm btn-outline-success w-100 py-1"
                                                    title="Finalizar corrida"
                                                >
                                                    Finalizar
                                                </button>
                                            )}
                                    {item.statusCorrida === "SOLICITADA" && (
                                                <button
                                                    onClick={() => handleAceitar(item)}
                                                    className="btn btn-sm btn-outline-warning text-dark w-100 py-1"
                                                    title="Aceitar corrida"
                                                >
                                                    Aceitar
                                                </button>
                                            )}
                                            {item.statusCorrida === "ACEITA" && (
                                                <button
                                                    onClick={() => handleIniciar(item)}
                                                    className="btn btn-sm btn-outline-success w-100 py-1"
                                                    title="Iniciar corrida e abrir rota"
                                                >
                                                    Iniciar
                                                </button>
                                            )}
                                        </div>
                                        <span className={`${statusBadgeClass(item.statusCorrida)} w-100 text-center`}>
                                            {statusLabel(item.statusCorrida)}
                                        </span>
                                    </div>
                                </td>
                                <td>{item.dataHoraSolicitacao}</td>
                                <td>
                                    {item.dataHoraInicio && item.dataHoraFim
                                        ? formatarDuracao(duracaoMsEntreIso(item.dataHoraInicio, item.dataHoraFim))
                                        : "-"}
                                </td>
                            <td className="d-flex gap-2">
                                <button
                                    onClick={() => handleCancelar(item.id)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Cancelar corrida"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => abrirEditar(item)}
                                    className="btn btn-sm btn-outline-primary"
                                    title={item.statusCorrida === "EM_ANDAMENTO" && item.id === corridaEmAndamentoId ? "Edição bloqueada enquanto a corrida está em andamento na janela da rota" : "Editar corrida"}
                                    disabled={item.statusCorrida === "EM_ANDAMENTO" && item.id === corridaEmAndamentoId}
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIdExcluirConfirmar(item.id)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Excluir corrida"
                                >
                                    X
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showModalFinalizadaLista && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Corrida finalizada</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => setShowModalFinalizadaLista(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">
                                    Tempo da corrida (do início até a finalização):{" "}
                                    <strong>{formatarDuracao(duracaoFinalizadaMs)}</strong>
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowModalFinalizadaLista(false)}
                                >
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {mostrarEditar && editarCorrida && (
            <div
                className="modal fade show"
                style={{display: "block", backgroundColor: "rgba(0,0,0,0.5)"}}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Corrida</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Fechar"
                                onClick={fecharEditar}
                            ></button>
                        </div>
                        <div className="modal-body">
                            {msgEdicao && <div className="alert alert-danger">{msgEdicao}</div>}
                            {carregandoEdicao || salvandoEdicao ? (
                                <p className="mb-0">Carregando...</p>
                            ) : (
                            <div>
                                <h5 className="mb-3">Identificação da corrida</h5>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">ID da corrida</label>
                                        <input type="text" className="form-control bg-light" value={editarCorrida.id ?? ""} readOnly disabled />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Idoso</label>
                                        <select
                                            className="form-select"
                                            value={editarCorrida.idoso?.id ?? ""}
                                            onChange={(e) => {
                                                const id = e.target.value ? Number(e.target.value) : null;
                                                const idoso = id ? listaIdosos.find((i) => i.id === id) : null;
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, idoso: idoso ? { id: idoso.id, nome: idoso.nome } : null } : prev
                                                );
                                            }}
                                        >
                                            <option value="">Selecione o idoso</option>
                                            {listaIdosos.map((i) => (
                                                <option key={i.id} value={i.id}>{i.nome ?? `Idoso ${i.id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Motorista</label>
                                        <select
                                            className="form-select"
                                            value={editarCorrida.motorista?.id ?? ""}
                                            onChange={(e) => {
                                                const id = e.target.value ? Number(e.target.value) : null;
                                                const mot = id ? listaMotoristas.find((m) => m.id === id) : null;
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, motorista: mot ? { id: mot.id, nome: mot.nome } : null } : prev
                                                );
                                            }}
                                        >
                                            <option value="">Selecione o motorista</option>
                                            {listaMotoristas.map((m) => (
                                                <option key={m.id} value={m.id}>{m.nome ?? `Motorista ${m.id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h5 className="mb-3">Status e data</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={editarCorrida.statusCorrida || "SOLICITADA"}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, statusCorrida: e.target.value } : prev
                                                )
                                            }
                                        >
                                            <option value="SOLICITADA">SOLICITADA</option>
                                            <option value="ACEITA">ACEITA</option>
                                            <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                                            <option value="FINALIZADA">FINALIZADA</option>
                                            <option value="CANCELADA">CANCELADA</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Data/Hora da solicitação</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={editarCorrida.dataHoraSolicitacao ? String(editarCorrida.dataHoraSolicitacao).slice(0, 16) : ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, dataHoraSolicitacao: e.target.value || null } : prev
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Data/Hora início da corrida</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={editarCorrida.dataHoraInicio ? String(editarCorrida.dataHoraInicio).slice(0, 16) : ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, dataHoraInicio: e.target.value || null } : prev
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Data/Hora fim da corrida</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={editarCorrida.dataHoraFim ? String(editarCorrida.dataHoraFim).slice(0, 16) : ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, dataHoraFim: e.target.value || null } : prev
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <strong>Duração:</strong>{" "}
                                        {editarCorrida.dataHoraInicio && editarCorrida.dataHoraFim
                                            ? formatarDuracao(duracaoMsEntreIso(editarCorrida.dataHoraInicio, editarCorrida.dataHoraFim))
                                            : "— preencha início e fim"}
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h5 className="mb-3">Endereço de origem</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Logradouro (origem)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editarCorrida.origem?.logradouro || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, origem: { ...(prev.origem || {}), logradouro: e.target.value } } : prev
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Número (origem)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editarCorrida.origem?.numero || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, origem: { ...(prev.origem || {}), numero: e.target.value } } : prev
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Estado (origem)</label>
                                        <select
                                            className="form-select"
                                            value={editOrigemEstado}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                setEditOrigemEstado(valor);
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, origem: { ...(prev.origem || {}), estado: valor, cidade: "" } } : prev
                                                );
                                            }}
                                        >
                                            <option value="">Selecione o estado</option>
                                            {estados.map((estado) => (
                                                <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Cidade (origem)</label>
                                        <select
                                            className="form-select"
                                            value={editarCorrida.origem?.cidade || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, origem: { ...(prev.origem || {}), cidade: e.target.value } } : prev
                                                )
                                            }
                                            disabled={!editOrigemEstado}
                                        >
                                            <option value="">{editOrigemEstado ? "Selecione a cidade" : "Selecione o estado"}</option>
                                            {editOrigemCidades.map((cidade) => (
                                                <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h5 className="mb-3">Endereço de destino</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Logradouro (destino)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editarCorrida.destino?.logradouro || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, destino: { ...(prev.destino || {}), logradouro: e.target.value } } : prev
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Número (destino)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editarCorrida.destino?.numero || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, destino: { ...(prev.destino || {}), numero: e.target.value } } : prev
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Estado (destino)</label>
                                        <select
                                            className="form-select"
                                            value={editDestinoEstado}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                setEditDestinoEstado(valor);
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, destino: { ...(prev.destino || {}), estado: valor, cidade: "" } } : prev
                                                );
                                            }}
                                        >
                                            <option value="">Selecione o estado</option>
                                            {estados.map((estado) => (
                                                <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Cidade (destino)</label>
                                        <select
                                            className="form-select"
                                            value={editarCorrida.destino?.cidade || ""}
                                            onChange={(e) =>
                                                setEditarCorrida((prev) =>
                                                    prev ? { ...prev, destino: { ...(prev.destino || {}), cidade: e.target.value } } : prev
                                                )
                                            }
                                            disabled={!editDestinoEstado}
                                        >
                                            <option value="">{editDestinoEstado ? "Selecione a cidade" : "Selecione o estado"}</option>
                                            {editDestinoCidades.map((cidade) => (
                                                <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={fecharEditar}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={salvarEdicao}
                                disabled={salvandoEdicao}
                            >
                                {salvandoEdicao ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
            {mostrarConfirmarExcluirLote && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="modalExcluirLoteLabel"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalExcluirLoteLabel">Excluir corridas selecionadas</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => !excluindoLote && setMostrarConfirmarExcluirLote(false)}
                                />
                            </div>
                            <div className="modal-body">
                                Deseja realmente excluir as {idsSelecionados.size} corrida(s) selecionada(s)? Apenas os registros das corridas serão removidos.
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setMostrarConfirmarExcluirLote(false)}
                                    disabled={excluindoLote}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={executarExcluirLote}
                                    disabled={excluindoLote}
                                >
                                    {excluindoLote ? "Excluindo..." : "Excluir"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {mostrarConfirmarExcluirTodas && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="modalExcluirTodasLabel"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalExcluirTodasLabel">Excluir todas as corridas</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => !excluindoTodas && setMostrarConfirmarExcluirTodas(false)}
                                />
                            </div>
                            <div className="modal-body">
                                Deseja realmente excluir todas as {listaCorridas.length} corrida(s)? Apenas os registros das corridas serão removidos. Esta ação não pode ser desfeita.
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setMostrarConfirmarExcluirTodas(false)}
                                    disabled={excluindoTodas}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={executarExcluirTodas}
                                    disabled={excluindoTodas}
                                >
                                    {excluindoTodas ? "Excluindo..." : "Excluir todas"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {idExcluirConfirmar != null && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="modalExcluirLabel"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalExcluirLabel">Confirmar exclusão</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => setIdExcluirConfirmar(null)}
                                />
                            </div>
                            <div className="modal-body">
                                Deseja realmente excluir esta corrida? Apenas o registro da corrida será removido.
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIdExcluirConfirmar(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => executarExclusao(idExcluirConfirmar)}
                                    disabled={loading}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {mostrarCarregando && <div className="loading-footer">Carregando</div>}
        </>
    );
}

export default ListarTodosCorridas;