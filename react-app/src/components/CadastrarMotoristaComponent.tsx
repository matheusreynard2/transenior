import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import { estados, fetchCidades, enderecoVazio, enderecoParaPayload, EnderecoForm } from "../interfaces/endereco.ts";

const CAMPOS_OBRIGATORIOS_MOTORISTA = ["nome", "cpf", "dataNascimento", "cnh", "telefone", "email"] as const;

const servicosDisponiveis = [
    "Administração de medicamentos",
    "Controle de sinais vitais (pressão, glicemia, temperatura)",
    "Auxílio em higiene pessoal (banho, troca de fraldas)",
    "Auxílio em alimentação (preparo e administração, inclusive via sonda)",
    "Auxílio em locomoção e transferência",
    "Acompanhamento a consultas e exames",
    "Exercícios de estimulação cognitiva",
    "Exercícios físicos leves / fisioterapia básica",
    "Curativos simples",
    "Manuseio de equipamentos (oxigênio, aspirador, cadeira de rodas)",
    "Cuidados noturnos",
    "Preparo de refeições especiais (dietas restritivas)",
    "Tarefas domésticas leves"
];  

function CadastrarMotoristaComponent() {
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [cnh, setCnh] = useState("");
    const [coren, setCoren] = useState("");
    const [disponivel, setDisponivel] = useState(true);
    const [aprovado, setAprovado] = useState(false);
    const [servicoSelecionado, setServicoSelecionado] = useState("");
    const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
    const [origem, setOrigem] = useState<EnderecoForm>(enderecoVazio());
    const [destino, setDestino] = useState<EnderecoForm>(enderecoVazio());
    const [cidadesOrigem, setCidadesOrigem] = useState<{ id: number; nome: string }[]>([]);
    const [cidadesDestino, setCidadesDestino] = useState<{ id: number; nome: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [erros, setErros] = useState<Record<string, boolean>>({});
    const [mostrarPopupSucesso, setMostrarPopupSucesso] = useState(false);
    const refNome = useRef<HTMLInputElement>(null);
    const refCpf = useRef<HTMLInputElement>(null);
    const refDataNascimento = useRef<HTMLInputElement>(null);
    const refCnh = useRef<HTMLInputElement>(null);
    const refTelefone = useRef<HTMLInputElement>(null);
    const refEmail = useRef<HTMLInputElement>(null);
    const refsCampo: Record<string, React.RefObject<HTMLInputElement | null>> = {
        nome: refNome,
        cpf: refCpf,
        dataNascimento: refDataNascimento,
        cnh: refCnh,
        telefone: refTelefone,
        email: refEmail,
    };

    useEffect(() => {
        if (!origem.estado) {
            setCidadesOrigem([]);
            return;
        }
        fetchCidades(origem.estado).then(setCidadesOrigem).catch(() => setCidadesOrigem([]));
    }, [origem.estado]);

    useEffect(() => {
        if (!destino.estado) {
            setCidadesDestino([]);
            return;
        }
        fetchCidades(destino.estado).then(setCidadesDestino).catch(() => setCidadesDestino([]));
    }, [destino.estado]);

    const inserirServico = () => {
        if (!servicoSelecionado) {
            return;
        }
        if (servicosSelecionados.includes(servicoSelecionado)) {
            return;
        }
        setServicosSelecionados((prev) => [...prev, servicoSelecionado]);
        setServicoSelecionado("");
    };

    const removerServico = (servico: string) => {
        setServicosSelecionados((prev) => prev.filter((item) => item !== servico));
    };

    const limparFormulario = () => {
        setNome("");
        setCpf("");
        setDataNascimento("");
        setTelefone("");
        setEmail("");
        setAtivo(true);
        setCnh("");
        setCoren("");
        setDisponivel(true);
        setAprovado(false);
        setServicosSelecionados([]);
        setServicoSelecionado("");
        setOrigem(enderecoVazio());
        setDestino(enderecoVazio());
    };

    const popularDadosTeste = () => {
        setErros({});
        setMensagem(null);
        setNome("João Santos");
        setCpf("987.654.321-00");
        setDataNascimento("1985-10-20");
        setTelefone("(11) 97654-3210");
        setEmail("joao.santos@email.com");
        setCnh("12345678900");
        setCoren("COREN-SP 123456");
        setServicosSelecionados([
            "Acompanhamento a consultas e exames",
            "Auxílio em locomoção e transferência",
        ]);
        setServicoSelecionado("");
        setOrigem({
            id: 0,
            logradouro: "Rua Augusta",
            numero: "500",
            estado: "SP",
            cidade: "São Paulo",
        });
        setDestino({
            id: 0,
            logradouro: "Av. Brigadeiro Faria Lima",
            numero: "2000",
            estado: "SP",
            cidade: "São Paulo",
        });
    };

    const validar = (): boolean => {
        const vals = {
            nome: nome.trim(),
            cpf: cpf.trim(),
            dataNascimento: dataNascimento.trim(),
            cnh: cnh.trim(),
            telefone: telefone.trim(),
            email: email.trim(),
        };
        const novosErros: Record<string, boolean> = {};
        for (const campo of CAMPOS_OBRIGATORIOS_MOTORISTA) {
            if (!vals[campo]) novosErros[campo] = true;
        }
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) {
            const primeiro = CAMPOS_OBRIGATORIOS_MOTORISTA.find((c) => novosErros[c]);
            if (primeiro) {
                setTimeout(() => refsCampo[primeiro]?.current?.focus(), 0);
            }
            return false;
        }
        return true;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMensagem(null);
        if (!validar()) return;
        setLoading(true);

        try {
            const dto = {
                nome,
                cpf,
                dataNascimento,
                telefone,
                email,
                ativo,
                cnh,
                coren,
                disponivel,
                aprovado,
                servicos: servicosSelecionados.join(", "),
                enderecoOrigem: enderecoParaPayload(origem) ?? null,
                enderecoDestino: enderecoParaPayload(destino) ?? null,
            };
            await axios.post(`${API_BASE}/motoristas`, dto);
            limparFormulario();
            setMostrarPopupSucesso(true);
        } catch (error) {
            setMensagem("Erro ao cadastrar motorista.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <form className="id_form_cadastrar" onSubmit={handleSubmit} noValidate>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <h2 className="mb-0">Cadastrar Motorista</h2>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={popularDadosTeste}
                            disabled={loading}
                            title="Preenche o formulário com dados de teste"
                        >
                            Popular com dados de teste
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Cadastrar Motorista
                        </button>
                        {loading && <span className="text-muted small">Carregando...</span>}
                    </div>
                </div>
                {mensagem && (
                    <div className="alert alert-danger">{mensagem}</div>
                )}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Nome: <span className="text-danger">*</span></label>
                        <input
                            ref={refNome}
                            type="text"
                            className={`form-control ${erros.nome ? "is-invalid" : ""}`}
                            value={nome}
                            onChange={(e) => { setNome(e.target.value); setErros((p) => ({ ...p, nome: false })); }}
                            disabled={loading}
                            required
                        />
                        {erros.nome && <div className="invalid-feedback">Preencha o nome.</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">CPF: <span className="text-danger">*</span></label>
                        <input
                            ref={refCpf}
                            type="text"
                            className={`form-control ${erros.cpf ? "is-invalid" : ""}`}
                            value={cpf}
                            onChange={(e) => { setCpf(e.target.value); setErros((p) => ({ ...p, cpf: false })); }}
                            disabled={loading}
                            required
                        />
                        {erros.cpf && <div className="invalid-feedback">Preencha o CPF.</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Data de Nascimento: <span className="text-danger">*</span></label>
                        <input
                            ref={refDataNascimento}
                            type="date"
                            className={`form-control ${erros.dataNascimento ? "is-invalid" : ""}`}
                            value={dataNascimento}
                            onChange={(e) => { setDataNascimento(e.target.value); setErros((p) => ({ ...p, dataNascimento: false })); }}
                            disabled={loading}
                            max={new Date().toISOString().split("T")[0]}
                            required
                        />
                        {erros.dataNascimento && <div className="invalid-feedback">Preencha a data de nascimento.</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">CNH: <span className="text-danger">*</span></label>
                        <input
                            ref={refCnh}
                            type="text"
                            className={`form-control ${erros.cnh ? "is-invalid" : ""}`}
                            value={cnh}
                            onChange={(e) => { setCnh(e.target.value); setErros((p) => ({ ...p, cnh: false })); }}
                            disabled={loading}
                            required
                        />
                        {erros.cnh && <div className="invalid-feedback">Preencha a CNH.</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Telefone: <span className="text-danger">*</span></label>
                        <input
                            ref={refTelefone}
                            type="text"
                            className={`form-control ${erros.telefone ? "is-invalid" : ""}`}
                            value={telefone}
                            onChange={(e) => { setTelefone(e.target.value); setErros((p) => ({ ...p, telefone: false })); }}
                            disabled={loading}
                        />
                        {erros.telefone && <div className="invalid-feedback">Preencha o telefone.</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email: <span className="text-danger">*</span></label>
                        <input
                            ref={refEmail}
                            type="email"
                            className={`form-control ${erros.email ? "is-invalid" : ""}`}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErros((p) => ({ ...p, email: false })); }}
                            disabled={loading}
                        />
                        {erros.email && <div className="invalid-feedback">Preencha o e-mail.</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">COREN:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={coren}
                            onChange={(e) => setCoren(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Serviços:</label>
                    <div className="row g-2">
                        <div className="col-md-8">
                            <select
                                className="form-select"
                                value={servicoSelecionado}
                                onChange={(e) => setServicoSelecionado(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Selecione um serviço</option>
                                {servicosDisponiveis.map((servico) => (
                                    <option key={servico} value={servico}>
                                        {servico}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 d-grid">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={inserirServico}
                                disabled={loading || !servicoSelecionado}
                            >
                                Inserir
                            </button>
                        </div>
                    </div>
                    {servicosSelecionados.length > 0 && (
                        <div className="mt-3">
                            <div className="d-flex flex-wrap gap-2">
                                {servicosSelecionados.map((servico) => (
                                    <span key={servico} className="badge bg-primary">
                                        {servico}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-light ms-2"
                                            onClick={() => removerServico(servico)}
                                            disabled={loading}
                                        >
                                            x
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <hr className="my-4" />
                <h5 className="mb-3">Endereço de origem</h5>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Logradouro (origem):</label>
                        <input
                            type="text"
                            className="form-control"
                            value={origem.logradouro}
                            onChange={(e) => setOrigem((p) => ({ ...p, logradouro: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Número (origem):</label>
                        <input
                            type="text"
                            className="form-control"
                            value={origem.numero}
                            onChange={(e) => setOrigem((p) => ({ ...p, numero: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Estado (origem):</label>
                        <select
                            className="form-select"
                            value={origem.estado}
                            onChange={(e) => setOrigem((p) => ({ ...p, estado: e.target.value, cidade: "" }))}
                            disabled={loading}
                        >
                            <option value="">Selecione</option>
                            {estados.map((e) => (
                                <option key={e.sigla} value={e.sigla}>{e.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Cidade (origem):</label>
                        <select
                            className="form-select"
                            value={origem.cidade}
                            onChange={(e) => setOrigem((p) => ({ ...p, cidade: e.target.value }))}
                            disabled={loading || !origem.estado}
                        >
                            <option value="">{origem.estado ? "Selecione" : "Selecione o estado"}</option>
                            {cidadesOrigem.map((c) => (
                                <option key={c.id} value={c.nome}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <h5 className="mb-3 mt-3">Endereço de destino</h5>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Logradouro (destino):</label>
                        <input
                            type="text"
                            className="form-control"
                            value={destino.logradouro}
                            onChange={(e) => setDestino((p) => ({ ...p, logradouro: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Número (destino):</label>
                        <input
                            type="text"
                            className="form-control"
                            value={destino.numero}
                            onChange={(e) => setDestino((p) => ({ ...p, numero: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Estado (destino):</label>
                        <select
                            className="form-select"
                            value={destino.estado}
                            onChange={(e) => setDestino((p) => ({ ...p, estado: e.target.value, cidade: "" }))}
                            disabled={loading}
                        >
                            <option value="">Selecione</option>
                            {estados.map((e) => (
                                <option key={e.sigla} value={e.sigla}>{e.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Cidade (destino):</label>
                        <select
                            className="form-select"
                            value={destino.cidade}
                            onChange={(e) => setDestino((p) => ({ ...p, cidade: e.target.value }))}
                            disabled={loading || !destino.estado}
                        >
                            <option value="">{destino.estado ? "Selecione" : "Selecione o estado"}</option>
                            {cidadesDestino.map((c) => (
                                <option key={c.id} value={c.nome}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <hr className="my-4" />
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={ativo}
                                onChange={(e) => setAtivo(e.target.checked)}
                                disabled={loading}
                                id="motoristaAtivo"
                            />
                            <label className="form-check-label" htmlFor="motoristaAtivo">
                                Ativo
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={disponivel}
                                onChange={(e) => setDisponivel(e.target.checked)}
                                disabled={loading}
                                id="motoristaDisponivel"
                            />
                            <label className="form-check-label" htmlFor="motoristaDisponivel">
                                Disponível
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={aprovado}
                                onChange={(e) => setAprovado(e.target.checked)}
                                disabled={loading}
                                id="motoristaAprovado"
                            />
                            <label className="form-check-label" htmlFor="motoristaAprovado">
                                Aprovado
                            </label>
                        </div>
                    </div>
                </div>
            </form>

            {mostrarPopupSucesso && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-success">Cadastro realizado</h5>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setMostrarPopupSucesso(false)} />
                            </div>
                            <div className="modal-body">Motorista cadastrado com sucesso.</div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-primary" onClick={() => setMostrarPopupSucesso(false)}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastrarMotoristaComponent;
