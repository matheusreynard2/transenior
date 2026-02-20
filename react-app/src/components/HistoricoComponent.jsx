import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8080/v1";

function formatDataHora(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function estiloColunaTipo(tipoAcao) {
    switch (tipoAcao) {
        case "TROCA_STATUS":
            return { backgroundColor: "#0d6efd", color: "#fff" };
        case "EXCLUSAO":
            return { backgroundColor: "#dc3545", color: "#fff" };
        case "CADASTRO":
            return { backgroundColor: "#198754", color: "#fff" };
        case "ATUALIZACAO":
            return { backgroundColor: "#ffc107", color: "#000" };
        case "PAUSAR":
            return { backgroundColor: "#fd7e14", color: "#fff" };
        case "RETOMAR":
            return { backgroundColor: "#20c997", color: "#fff" };
        default:
            return {};
    }
}

function HistoricoComponent() {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limpando, setLimpando] = useState(false);
    const [erro, setErro] = useState(null);
    const [mostrarConfirmarLimpar, setMostrarConfirmarLimpar] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);
    const [idsSelecionados, setIdsSelecionados] = useState(new Set());
    const [excluindoLote, setExcluindoLote] = useState(false);
    const [mostrarConfirmarLote, setMostrarConfirmarLote] = useState(false);

    const carregar = () => {
        setLoading(true);
        setErro(null);
        axios
            .get(`${API}/historicos`)
            .then((r) => setLista(r.data || []))
            .catch(() => setErro("Erro ao carregar histórico."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        carregar();
    }, []);

    const abrirConfirmarLimpar = () => setMostrarConfirmarLimpar(true);

    const executarLimparHistorico = () => {
        setLimpando(true);
        axios
            .delete(`${API}/historicos`)
            .then(() => {
                setMostrarConfirmarLimpar(false);
                carregar();
            })
            .catch(() => setErro("Erro ao limpar histórico."))
            .finally(() => setLimpando(false));
    };

    const excluirRegistro = (id) => {
        if (!id) return;
        setExcluindoId(id);
        setErro(null);
        axios
            .delete(`${API}/historicos/${id}`)
            .then(() => {
                setLista((prev) => prev.filter((item) => item.id !== id));
                setIdsSelecionados((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            })
            .catch(() => setErro("Erro ao excluir registro."))
            .finally(() => setExcluindoId(null));
    };

    const toggleSelecao = (id) => {
        setIdsSelecionados((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelecionarTodos = () => {
        if (idsSelecionados.size === lista.length) {
            setIdsSelecionados(new Set());
        } else {
            setIdsSelecionados(new Set(lista.map((item) => item.id)));
        }
    };

    const abrirConfirmarExcluirLote = () => {
        if (idsSelecionados.size === 0) return;
        setMostrarConfirmarLote(true);
    };

    const executarExcluirLote = () => {
        const ids = Array.from(idsSelecionados);
        if (ids.length === 0) return;
        setExcluindoLote(true);
        setErro(null);
        axios
            .request({
                url: `${API}/historicos/em-lote`,
                method: "delete",
                data: { ids },
            })
            .then(() => {
                setMostrarConfirmarLote(false);
                setIdsSelecionados(new Set());
                carregar();
            })
            .catch(() => setErro("Erro ao excluir registros selecionados."))
            .finally(() => setExcluindoLote(false));
    };

    if (loading && lista.length === 0) return <div className="mt-3">Carregando histórico...</div>;
    if (erro && lista.length === 0) return <div className="alert alert-warning mt-3">{erro}</div>;

    return (
        <div className="historico-page">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <h2 className="mb-1">Histórico</h2>
                    <p className="text-muted mb-0 small">Ações realizadas no sistema (cadastros, atualizações, exclusões e trocas de status de corridas).</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={abrirConfirmarExcluirLote}
                        disabled={excluindoLote || idsSelecionados.size === 0 || lista.length === 0}
                        title="Excluir registros selecionados"
                    >
                        {excluindoLote ? "Excluindo..." : `Excluir selecionados (${idsSelecionados.size})`}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={abrirConfirmarLimpar}
                        disabled={limpando || lista.length === 0}
                        title="Excluir todos os registros do histórico"
                    >
                        {limpando ? "Limpando..." : "Limpar histórico"}
                    </button>
                </div>
            </div>
            {erro && <div className="alert alert-warning">{erro}</div>}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: "40px" }}>
                                <input
                                    type="checkbox"
                                    checked={lista.length > 0 && idsSelecionados.size === lista.length}
                                    onChange={toggleSelecionarTodos}
                                    title="Selecionar todos"
                                    aria-label="Selecionar todos"
                                />
                            </th>
                            <th>Data / Hora</th>
                            <th>Tipo</th>
                            <th>Entidade</th>
                            <th>Descrição</th>
                            <th style={{ width: "90px" }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.length === 0 ? (
                            <tr>
                                <td colSpan="6">Nenhum registro no histórico.</td>
                            </tr>
                        ) : (
                            lista.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={idsSelecionados.has(item.id)}
                                            onChange={() => toggleSelecao(item.id)}
                                            aria-label={`Selecionar registro ${item.id}`}
                                        />
                                    </td>
                                    <td>{formatDataHora(item.dataHora)}</td>
                                    <td style={estiloColunaTipo(item.tipoAcao)}>{item.tipoAcao ?? "-"}</td>
                                    <td>{item.entidadeAfetada ?? "-"}</td>
                                    <td>{item.descricao ?? "-"}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm py-0"
                                            onClick={() => excluirRegistro(item.id)}
                                            disabled={excluindoId === item.id}
                                            title="Excluir este registro"
                                        >
                                            {excluindoId === item.id ? "..." : "Excluir"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {mostrarConfirmarLote && (
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
                                <h5 className="modal-title" id="modalExcluirLoteLabel">
                                    Excluir registros selecionados
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => !excluindoLote && setMostrarConfirmarLote(false)}
                                />
                            </div>
                            <div className="modal-body">
                                Deseja realmente excluir os {idsSelecionados.size} registro(s) selecionado(s)?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setMostrarConfirmarLote(false)}
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
            {mostrarConfirmarLimpar && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="modalLimparHistoricoLabel"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalLimparHistoricoLabel">
                                    Confirmar limpeza do histórico
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => !limpando && setMostrarConfirmarLimpar(false)}
                                />
                            </div>
                            <div className="modal-body">
                                Deseja realmente limpar todo o histórico? Todos os registros de ações serão excluídos.
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setMostrarConfirmarLimpar(false)}
                                    disabled={limpando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={executarLimparHistorico}
                                    disabled={limpando}
                                >
                                    {limpando ? "Limpando..." : "Limpar histórico"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoricoComponent;
