import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import { API_BASE } from "../config/api";
const API = API_BASE;

const formatObj = (obj) => {
    if (obj == null) return "-";
    if (typeof obj === "object" && obj.id != null) return `${obj.nome ?? "N/A"} (id: ${obj.id})`;
    return String(obj);
};

const formatEndereco = (e) => {
    if (!e) return "-";
    const parts = [e.logradouro, e.numero, e.cidade, e.estado].filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
};

function ListarTodosDados() {
    const [activeTab, setActiveTab] = useState("motoristas");
    const [motoristas, setMotoristas] = useState([]);
    const [idosos, setIdosos] = useState([]);
    const [enderecos, setEnderecos] = useState([]);
    const [relacionamentos, setRelacionamentos] = useState([]);
    const [loading, setLoading] = useState({ m: true, i: true, e: true, r: true });
    const [erro, setErro] = useState(null);

    const [idsMotoristas, setIdsMotoristas] = useState(new Set());
    const [idsIdosos, setIdsIdosos] = useState(new Set());
    const [idsEnderecos, setIdsEnderecos] = useState(new Set());
    const [idsRelacionamentos, setIdsRelacionamentos] = useState(new Set());

    const [modalUm, setModalUm] = useState({ tab: null, id: null });
    const [modalLote, setModalLote] = useState({ tab: null, ids: [] });
    const [modalTodos, setModalTodos] = useState(null);
    const [modalEnderecoVinculado, setModalEnderecoVinculado] = useState(null);
    const [excluindo, setExcluindo] = useState(false);

    const carregar = useCallback(() => {
        setErro(null);
        axios.get(`${API}/motoristas`).then((r) => setMotoristas(r.data || [])).catch(() => setErro("Erro ao carregar motoristas")).finally(() => setLoading((l) => ({ ...l, m: false })));
        axios.get(`${API}/idosos`).then((r) => setIdosos(r.data || [])).catch(() => setErro("Erro ao carregar idosos")).finally(() => setLoading((l) => ({ ...l, i: false })));
        axios.get(`${API}/enderecos`).then((r) => setEnderecos(r.data || [])).catch(() => setErro("Erro ao carregar endereços")).finally(() => setLoading((l) => ({ ...l, e: false })));
        axios.get(`${API}/relacionamentos`).then((r) => setRelacionamentos(r.data || [])).catch(() => setErro("Erro ao carregar relacionamentos")).finally(() => setLoading((l) => ({ ...l, r: false })));
    }, []);

    useEffect(() => {
        setLoading({ m: true, i: true, e: true, r: true });
        carregar();
    }, [carregar]);

    const endpoints = {
        motoristas: `${API}/motoristas`,
        idosos: `${API}/idosos`,
        enderecos: `${API}/enderecos`,
        relacionamentos: `${API}/relacionamentos`,
    };

    const toggleSelecao = (tab, id) => {
        const setters = { motoristas: setIdsMotoristas, idosos: setIdsIdosos, enderecos: setIdsEnderecos, relacionamentos: setIdsRelacionamentos };
        const sets = { motoristas: idsMotoristas, idosos: idsIdosos, enderecos: idsEnderecos, relacionamentos: idsRelacionamentos };
        setters[tab]((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelecionarTodos = (tab) => {
        const setters = { motoristas: setIdsMotoristas, idosos: setIdsIdosos, enderecos: setIdsEnderecos, relacionamentos: setIdsRelacionamentos };
        const listas = { motoristas, idosos, enderecos, relacionamentos };
        const sets = { motoristas: idsMotoristas, idosos: idsIdosos, enderecos: idsEnderecos, relacionamentos: idsRelacionamentos };
        const lista = listas[tab];
        if (sets[tab].size === lista.length) setters[tab](new Set());
        else setters[tab](new Set(lista.map((x) => x.id)));
    };

    const excluirUm = (tab, id) => {
        if (!id) return;
        setExcluindo(true);
        setErro(null);
        setModalEnderecoVinculado(null);
        axios.delete(`${endpoints[tab]}/${id}`)
            .then(() => { setModalUm({ tab: null, id: null }); carregar(); })
            .catch((err) => {
                if (tab === "enderecos" && err.response?.status === 409 && err.response?.data?.mensagem) {
                    setModalUm({ tab: null, id: null });
                    setModalEnderecoVinculado(err.response.data.mensagem);
                } else {
                    setErro(`Erro ao excluir ${tab === "motoristas" ? "motorista" : tab === "idosos" ? "idoso" : tab === "relacionamentos" ? "relacionamento" : "endereço"}.`);
                }
            })
            .finally(() => setExcluindo(false));
    };

    const excluirLote = (tab, ids) => {
        if (!ids || ids.length === 0) return;
        setExcluindo(true);
        setErro(null);
        setModalEnderecoVinculado(null);
        axios.request({ url: `${endpoints[tab]}/em-lote`, method: "delete", data: { ids } })
            .then(() => { setModalLote({ tab: null, ids: [] }); setIdsMotoristas(new Set()); setIdsIdosos(new Set()); setIdsEnderecos(new Set()); setIdsRelacionamentos(new Set()); carregar(); })
            .catch((err) => {
                if (tab === "enderecos" && err.response?.status === 409 && err.response?.data?.mensagem) {
                    setModalLote({ tab: null, ids: [] });
                    setModalEnderecoVinculado(err.response.data.mensagem);
                } else {
                    setErro("Erro ao excluir registros selecionados.");
                }
            })
            .finally(() => setExcluindo(false));
    };

    const excluirTodos = (tab) => {
        setExcluindo(true);
        setErro(null);
        setModalEnderecoVinculado(null);
        axios.delete(endpoints[tab])
            .then(() => { setModalTodos(null); setIdsMotoristas(new Set()); setIdsIdosos(new Set()); setIdsEnderecos(new Set()); setIdsRelacionamentos(new Set()); carregar(); })
            .catch((err) => {
                if (tab === "enderecos" && err.response?.status === 409 && err.response?.data?.mensagem) {
                    setModalTodos(null);
                    setModalEnderecoVinculado(err.response.data.mensagem);
                } else {
                    setErro("Erro ao excluir todos.");
                }
            })
            .finally(() => setExcluindo(false));
    };

    const idsSelecionados = { motoristas: idsMotoristas, idosos: idsIdosos, enderecos: idsEnderecos, relacionamentos: idsRelacionamentos };
    const listas = { motoristas, idosos, enderecos, relacionamentos };
    const labels = { motoristas: "Motoristas", idosos: "Idosos", enderecos: "Endereços", relacionamentos: "Relacionamentos" };
    const labelUm = { motoristas: "motorista", idosos: "idoso", enderecos: "endereço", relacionamentos: "relacionamento" };

    const renderBotoesAcoes = (tab) => {
        const lista = listas[tab];
        const ids = idsSelecionados[tab];
        const n = ids.size;
        return (
            <div className="d-flex gap-2 flex-wrap mb-3">
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => n > 0 && setModalLote({ tab, ids: Array.from(ids) })} disabled={excluindo || n === 0 || lista.length === 0}>
                    {excluindo ? "Excluindo..." : `Excluir selecionados (${n})`}
                </button>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => lista.length > 0 && setModalTodos(tab)} disabled={excluindo || lista.length === 0}>
                    Excluir todos
                </button>
            </div>
        );
    };

    const renderCheckboxTh = (tab) => {
        const lista = listas[tab];
        const ids = idsSelecionados[tab];
        return (
            <th style={{ width: "40px" }}>
                <input type="checkbox" checked={lista.length > 0 && ids.size === lista.length} onChange={() => toggleSelecionarTodos(tab)} title="Selecionar todos" aria-label="Selecionar todos" />
            </th>
        );
    };

    const renderCheckboxTd = (tab, id) => (
        <td>
            <input type="checkbox" checked={idsSelecionados[tab].has(id)} onChange={() => toggleSelecao(tab, id)} aria-label={`Selecionar ${id}`} />
        </td>
    );

    const renderBtnExcluir = (tab, id) => (
        <td>
            <button type="button" className="btn btn-outline-danger btn-sm py-0" onClick={() => setModalUm({ tab, id })} disabled={excluindo} title="Excluir">Excluir</button>
        </td>
    );

    return (
        <div className="listar-todos-dados">
            <h2 className="mb-4">Dados do sistema</h2>
            <p className="text-muted small mb-3">Exclua motoristas, idosos, relacionamentos ou endereços. Ao excluir um motorista ou idoso, as corridas e relacionamentos vinculados também são removidos. Para excluir endereços, é obrigatório excluir antes as corridas, motoristas e idosos que os utilizam.</p>
            {erro && <div className="alert alert-warning">{erro}</div>}
            <ul className="nav nav-tabs mb-3">
                {["motoristas", "idosos", "enderecos", "relacionamentos"].map((id) => (
                    <li className="nav-item" key={id}>
                        <button type="button" className={`nav-link ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{labels[id]}</button>
                    </li>
                ))}
            </ul>

            {activeTab === "motoristas" && (
                <div className="tab-pane">
                    {loading.m ? <p>Carregando motoristas...</p> : (
                        <>
                            {renderBotoesAcoes("motoristas")}
                            <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100%" }}>
                                <table className="table table-striped table-bordered" style={{ minWidth: "max-content", whiteSpace: "nowrap" }}>
                                    <thead className="table-dark">
                                        <tr>
                                            {renderCheckboxTh("motoristas")}
                                            <th>Id</th>
                                            <th>Nome</th>
                                            <th>CPF</th>
                                            <th>Data Nasc.</th>
                                            <th>Telefone</th>
                                            <th>Email</th>
                                            <th>Ativo</th>
                                            <th>CNH</th>
                                            <th>COREN</th>
                                            <th>Serviços</th>
                                            <th>Disponível</th>
                                            <th>Aprovado</th>
                                            <th>Endereço origem</th>
                                            <th>Endereço destino</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {motoristas.length === 0 ? (
                                            <tr><td colSpan="16">Nenhum motorista cadastrado.</td></tr>
                                        ) : (
                                            motoristas.map((m) => (
                                                <tr key={m.id}>
                                                    {renderCheckboxTd("motoristas", m.id)}
                                                    <td>{m.id}</td>
                                                    <td>{m.nome ?? "-"}</td>
                                                    <td>{m.cpf ?? "-"}</td>
                                                    <td>{m.dataNascimento ?? "-"}</td>
                                                    <td>{m.telefone ?? "-"}</td>
                                                    <td>{m.email ?? "-"}</td>
                                                    <td>{m.ativo ? "Sim" : "Não"}</td>
                                                    <td>{m.cnh ?? "-"}</td>
                                                    <td>{m.coren ?? "-"}</td>
                                                    <td>{m.servicos ?? "-"}</td>
                                                    <td>{m.disponivel ? "Sim" : "Não"}</td>
                                                    <td>{m.aprovado ? "Sim" : "Não"}</td>
                                                    <td>{formatEndereco(m.enderecoOrigem)}</td>
                                                    <td>{formatEndereco(m.enderecoDestino)}</td>
                                                    {renderBtnExcluir("motoristas", m.id)}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === "idosos" && (
                <div className="tab-pane">
                    {loading.i ? <p>Carregando idosos...</p> : (
                        <>
                            {renderBotoesAcoes("idosos")}
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            {renderCheckboxTh("idosos")}
                                            <th>Id</th>
                                            <th>Nome</th>
                                            <th>CPF</th>
                                            <th>Data Nasc.</th>
                                            <th>Telefone</th>
                                            <th>Email</th>
                                            <th>Ativo</th>
                                            <th>Contato emergência</th>
                                            <th>Endereço origem</th>
                                            <th>Endereço destino</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {idosos.length === 0 ? (
                                            <tr><td colSpan="12">Nenhum idoso cadastrado.</td></tr>
                                        ) : (
                                            idosos.map((i) => (
                                                <tr key={i.id}>
                                                    {renderCheckboxTd("idosos", i.id)}
                                                    <td>{i.id}</td>
                                                    <td>{i.nome ?? "-"}</td>
                                                    <td>{i.cpf ?? "-"}</td>
                                                    <td>{i.dataNascimento ?? "-"}</td>
                                                    <td>{i.telefone ?? "-"}</td>
                                                    <td>{i.email ?? "-"}</td>
                                                    <td>{i.ativo ? "Sim" : "Não"}</td>
                                                    <td>{i.contatoEmergencia ?? "-"}</td>
                                                    <td>{formatEndereco(i.enderecoOrigem)}</td>
                                                    <td>{formatEndereco(i.enderecoDestino)}</td>
                                                    {renderBtnExcluir("idosos", i.id)}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === "enderecos" && (
                <div className="tab-pane">
                    {loading.e ? <p>Carregando endereços...</p> : (
                        <>
                            {renderBotoesAcoes("enderecos")}
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            {renderCheckboxTh("enderecos")}
                                            <th>Id</th>
                                            <th>Logradouro</th>
                                            <th>Número</th>
                                            <th>Cidade</th>
                                            <th>Estado</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enderecos.length === 0 ? (
                                            <tr><td colSpan="7">Nenhum endereço cadastrado.</td></tr>
                                        ) : (
                                            enderecos.map((e) => (
                                                <tr key={e.id}>
                                                    {renderCheckboxTd("enderecos", e.id)}
                                                    <td>{e.id}</td>
                                                    <td>{e.logradouro ?? "-"}</td>
                                                    <td>{e.numero ?? "-"}</td>
                                                    <td>{e.cidade ?? "-"}</td>
                                                    <td>{e.estado ?? "-"}</td>
                                                    {renderBtnExcluir("enderecos", e.id)}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === "relacionamentos" && (
                <div className="tab-pane">
                    {loading.r ? <p>Carregando relacionamentos...</p> : (
                        <>
                            {renderBotoesAcoes("relacionamentos")}
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            {renderCheckboxTh("relacionamentos")}
                                            <th>Id</th>
                                            <th>Motorista</th>
                                            <th>Idoso</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relacionamentos.length === 0 ? (
                                            <tr><td colSpan="5">Nenhum relacionamento cadastrado.</td></tr>
                                        ) : (
                                            relacionamentos.map((r) => (
                                                <tr key={r.id}>
                                                    {renderCheckboxTd("relacionamentos", r.id)}
                                                    <td>{r.id}</td>
                                                    <td>{formatObj(r.motorista)}</td>
                                                    <td>{formatObj(r.idoso)}</td>
                                                    {renderBtnExcluir("relacionamentos", r.id)}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {modalUm.tab != null && modalUm.id != null && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Excluir {labelUm[modalUm.tab]}</h5>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => !excluindo && setModalUm({ tab: null, id: null })} />
                            </div>
                            <div className="modal-body">Deseja realmente excluir este {labelUm[modalUm.tab]} (id: {modalUm.id})?</div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalUm({ tab: null, id: null })} disabled={excluindo}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={() => excluirUm(modalUm.tab, modalUm.id)} disabled={excluindo}>{excluindo ? "Excluindo..." : "Excluir"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalLote.tab != null && modalLote.ids.length > 0 && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Excluir selecionados</h5>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => !excluindo && setModalLote({ tab: null, ids: [] })} />
                            </div>
                            <div className="modal-body">Deseja realmente excluir os {modalLote.ids.length} {labelUm[modalLote.tab]}(s) selecionado(s)?</div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalLote({ tab: null, ids: [] })} disabled={excluindo}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={() => excluirLote(modalLote.tab, modalLote.ids)} disabled={excluindo}>{excluindo ? "Excluindo..." : "Excluir"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalTodos != null && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Excluir todos os {labelUm[modalTodos]}s</h5>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => !excluindo && setModalTodos(null)} />
                            </div>
                            <div className="modal-body">Deseja realmente excluir todos os {labelUm[modalTodos]}s? Esta ação não pode ser desfeita.</div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalTodos(null)} disabled={excluindo}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={() => excluirTodos(modalTodos)} disabled={excluindo}>{excluindo ? "Excluindo..." : "Excluir todos"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {modalEnderecoVinculado && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modalEnderecoVinculadoLabel">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalEnderecoVinculadoLabel">Impossível excluir endereço(s)</h5>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setModalEnderecoVinculado(null)} />
                            </div>
                            <div className="modal-body">{modalEnderecoVinculado}</div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => setModalEnderecoVinculado(null)}>Entendi</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListarTodosDados;
