import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const paginas = [
    {
        sectionId: "sec-corridas",
        titulo: "Corridas",
        path: "/listarTodosCorridas",
        descricao: "Visualiza e gerencia corridas: iniciar, finalizar, editar, cancelar e excluir.",
        detalhes: [
            "Mostra a lista completa de corridas com status e horários.",
            "Permite iniciar e finalizar corridas com atualização de estado.",
            "Aceita edição de dados e exclusão individual ou em lote."
        ],
        comoFunciona: "Cada corrida segue um ciclo de status (Solicitada → Aceita → Em andamento → Finalizada). Você pode acompanhar o tempo, encerrar pelo botão Finalizar e remover corridas concluídas em lote.",
    },
    {
        sectionId: "sec-rota",
        titulo: "Rota da Corrida",
        path: "/rotaCorrida",
        descricao: "Mostra no mapa o trajeto entre origem e destino da corrida.",
        detalhes: [
            "Traça a rota com base no endereço inicial e final.",
            "Permite acompanhar visualmente o percurso da corrida.",
            "Integra com o fluxo de corrida em andamento."
        ],
        comoFunciona: "O sistema usa os endereços da corrida ativa para desenhar uma rota no mapa, com marcadores de origem, destino e a posição estimada do veículo durante o trajeto.",
    },
    {
        sectionId: "sec-cadastrar-motorista",
        titulo: "Cadastrar Motorista",
        path: "/cadastrarMotorista",
        descricao: "Cadastro de novos motoristas com dados pessoais e de atuação.",
        detalhes: [
            "Registra dados de identificação e contato do motorista.",
            "Armazena informações profissionais como CNH e disponibilidade.",
            "Vincula endereços para operação no sistema."
        ],
        comoFunciona: "Você preenche dados pessoais, profissionais e endereços de origem/destino. O motorista cadastrado fica disponível para ser relacionado a idosos e atender corridas.",
    },
    {
        sectionId: "sec-cadastrar-idoso",
        titulo: "Cadastrar Idoso",
        path: "/cadastrarIdoso",
        descricao: "Cadastro de idosos com contatos e endereços para corridas.",
        detalhes: [
            "Registra dados pessoais do idoso e contato de emergência.",
            "Define endereços de origem e destino usados nas corridas.",
            "Mantém os dados disponíveis para relacionamento com motoristas."
        ],
        comoFunciona: "Os dados do idoso (incluindo endereços e contato de emergência) são salvos para que ele possa ser vinculado a motoristas e participar de corridas.",
    },
    {
        sectionId: "sec-relacionar",
        titulo: "Relacionar Motorista/Idoso",
        path: "/relacionarMotoristaIdoso",
        descricao: "Define quais motoristas podem atender quais idosos.",
        detalhes: [
            "Cria vínculos entre motoristas e idosos cadastrados.",
            "Controla quais pares podem gerar corridas.",
            "Facilita o gerenciamento operacional do atendimento."
        ],
        comoFunciona: "Você seleciona um motorista e um idoso já cadastrados e cria o vínculo. A partir daí, esse par pode ter corridas associadas.",
    },
    {
        sectionId: "sec-dados-sistema",
        titulo: "Dados do sistema",
        path: "/listarTodosDados",
        descricao: "Painel consolidado com motoristas, idosos, endereços e relacionamentos.",
        detalhes: [
            "Apresenta visão geral de todas as entidades cadastradas.",
            "Ajuda na conferência de consistência dos dados.",
            "Centraliza consultas administrativas do sistema."
        ],
        comoFunciona: "É um painel administrativo onde você consulta tudo o que está cadastrado: motoristas, idosos, endereços e relacionamentos, podendo excluir registros individualmente ou em lote.",
    },
    {
        sectionId: "sec-historico",
        titulo: "Histórico",
        path: "/historico",
        descricao: "Registro de alterações e ações executadas no sistema.",
        detalhes: [
            "Exibe eventos de cadastro, atualização e remoção.",
            "Permite rastrear operações realizadas ao longo do tempo.",
            "Ajuda no controle e auditoria do uso do sistema."
        ],
        comoFunciona: "Toda ação relevante (cadastros, alterações, mudanças de status, exclusões) é registrada com data/hora, permitindo auditar quem fez o quê e quando.",
    },
];

function IconeCorridas() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <rect x="6" y="20" width="52" height="22" rx="4" fill="#2a3140" stroke="#5a6473" strokeWidth="1.5" />
            <rect x="14" y="14" width="36" height="10" rx="2" fill="#3a4250" />
            <circle cx="18" cy="46" r="5" fill="#0e1218" stroke="#a3acba" strokeWidth="2" />
            <circle cx="46" cy="46" r="5" fill="#0e1218" stroke="#a3acba" strokeWidth="2" />
        </svg>
    );
}

function IconeRota() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <path d="M14 50 Q 24 20, 40 30 T 54 18" stroke="#9aa3b2" strokeWidth="3" fill="none" strokeDasharray="5,4" />
            <circle cx="14" cy="50" r="5" fill="#5f6977" stroke="#cfd5e0" strokeWidth="1.5" />
            <circle cx="54" cy="18" r="5" fill="#9aa3b2" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
    );
}

function IconeMotorista() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <circle cx="32" cy="22" r="9" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <path d="M14 52 c0 -10 36 -10 36 0" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <rect x="40" y="38" width="14" height="10" rx="2" fill="#5f6977" stroke="#cfd5e0" strokeWidth="1" />
            <text x="47" y="46" fontSize="7" fill="#0e1218" textAnchor="middle">CNH</text>
        </svg>
    );
}

function IconeIdoso() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <circle cx="32" cy="22" r="9" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <path d="M14 52 c0 -10 36 -10 36 0" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <path d="M48 28 v18" stroke="#cfd5e0" strokeWidth="2" />
            <path d="M48 46 l-3 6" stroke="#cfd5e0" strokeWidth="2" />
        </svg>
    );
}

function IconeRelacionar() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <circle cx="16" cy="32" r="8" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <circle cx="48" cy="32" r="8" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <path d="M24 32 H40" stroke="#cfd5e0" strokeWidth="3" />
            <path d="M40 28 l4 4 -4 4" stroke="#cfd5e0" strokeWidth="2" fill="none" />
            <path d="M24 28 l-4 4 4 4" stroke="#cfd5e0" strokeWidth="2" fill="none" />
        </svg>
    );
}

function IconeDados() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <rect x="8" y="14" width="20" height="16" rx="2" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <rect x="36" y="14" width="20" height="16" rx="2" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <rect x="8" y="36" width="20" height="16" rx="2" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <rect x="36" y="36" width="20" height="16" rx="2" fill="#5f6977" stroke="#cfd5e0" strokeWidth="1.5" />
        </svg>
    );
}

function IconeHistorico() {
    return (
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
            <circle cx="32" cy="32" r="20" fill="#3a4250" stroke="#a3acba" strokeWidth="1.5" />
            <path d="M32 18 V32 L42 38" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
    );
}

function IconePorSecao({ sectionId }) {
    switch (sectionId) {
        case "sec-corridas": return <IconeCorridas />;
        case "sec-rota": return <IconeRota />;
        case "sec-cadastrar-motorista": return <IconeMotorista />;
        case "sec-cadastrar-idoso": return <IconeIdoso />;
        case "sec-relacionar": return <IconeRelacionar />;
        case "sec-dados-sistema": return <IconeDados />;
        case "sec-historico": return <IconeHistorico />;
        default: return null;
    }
}

const visualWrapStyle = {
    background: "linear-gradient(180deg, #0f1218 0%, #131720 100%)",
    border: "1px solid #2a3140",
    borderRadius: 10,
    padding: 14,
};

function VisualCorridas() {
    const itens = [
        { id: 178, status: "EM ANDAMENTO" },
        { id: 162, status: "FINALIZADA" },
        { id: 191, status: "SOLICITADA" },
    ];
    return (
        <div className="d-grid gap-2 mt-3" style={visualWrapStyle}>
            {itens.map((c) => (
                <div key={c.id} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#181d27", border: "1px solid #2d3340" }}>
                    <span style={{ color: "#dde3ee" }}>Corrida #{c.id}</span>
                    <span className="badge" style={{ background: "#4a5363", color: "#fff" }}>{c.status}</span>
                </div>
            ))}
        </div>
    );
}

function VisualRota() {
    return (
        <div className="mt-3" style={visualWrapStyle}>
            <svg viewBox="0 0 320 90" style={{ width: "100%", height: 90 }}>
                <path d="M20 60 Q 80 0, 160 50 T 300 25" stroke="#9aa3b2" strokeWidth="3" fill="none" strokeDasharray="6,4" />
                <circle cx="20" cy="60" r="7" fill="#5f6977" stroke="#dde3ee" strokeWidth="2" />
                <circle cx="300" cy="25" r="7" fill="#a3acba" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="d-flex justify-content-between small" style={{ color: "#aab1bd" }}>
                <span>● Origem</span>
                <span>● Destino</span>
            </div>
        </div>
    );
}

function VisualFormulario({ campos }) {
    return (
        <div className="mt-3 d-grid gap-2" style={visualWrapStyle}>
            {campos.map((campo) => (
                <div key={campo} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#181d27", border: "1px solid #2d3340" }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: "50%", background: "#7d8696", flexShrink: 0,
                    }} />
                    <span style={{ color: "#dde3ee", fontSize: "0.9rem" }}>{campo}</span>
                </div>
            ))}
        </div>
    );
}

function VisualRelacionar() {
    return (
        <div className="mt-3 d-flex align-items-center justify-content-around" style={{ ...visualWrapStyle, padding: "20px 14px" }}>
            <div className="text-center">
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#3a4250", border: "1px solid #a3acba", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 22 }}>👨‍✈️</div>
                <div style={{ color: "#dde3ee", marginTop: 6, fontSize: "0.85rem" }}>Motorista</div>
            </div>
            <svg viewBox="0 0 80 30" width="100" height="30">
                <path d="M5 15 H75" stroke="#cfd5e0" strokeWidth="2" />
                <circle cx="5" cy="15" r="3" fill="#cfd5e0" />
                <circle cx="75" cy="15" r="3" fill="#cfd5e0" />
            </svg>
            <div className="text-center">
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#3a4250", border: "1px solid #a3acba", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 22 }}>👵</div>
                <div style={{ color: "#dde3ee", marginTop: 6, fontSize: "0.85rem" }}>Idoso</div>
            </div>
        </div>
    );
}

function VisualDados() {
    const blocos = [
        { label: "Motoristas", valor: 24 },
        { label: "Idosos", valor: 38 },
        { label: "Endereços", valor: 67 },
        { label: "Relacionamentos", valor: 41 },
    ];
    return (
        <div className="mt-3" style={visualWrapStyle}>
            <div className="row g-2">
                {blocos.map((b) => (
                    <div key={b.label} className="col-6">
                        <div className="p-2 rounded" style={{ background: "#181d27", border: "1px solid #2d3340" }}>
                            <div style={{ color: "#aab1bd", fontSize: "0.78rem" }}>{b.label}</div>
                            <div style={{ color: "#ffffff", fontSize: "1.4rem", fontWeight: 700 }}>{b.valor}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VisualHistorico() {
    const eventos = [
        { tag: "CADASTRO", texto: "Idoso cadastrado" },
        { tag: "TROCA_STATUS", texto: "Corrida iniciada" },
        { tag: "ATUALIZACAO", texto: "Endereço atualizado" },
    ];
    return (
        <div className="mt-3 d-grid gap-2" style={visualWrapStyle}>
            {eventos.map((e, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#181d27", border: "1px solid #2d3340" }}>
                    <span className="badge" style={{ background: "#4a5363", color: "#fff", fontSize: "0.65rem" }}>{e.tag}</span>
                    <span style={{ color: "#dde3ee", fontSize: "0.88rem" }}>{e.texto}</span>
                </div>
            ))}
        </div>
    );
}

function VisualPorSecao({ sectionId }) {
    switch (sectionId) {
        case "sec-corridas": return <VisualCorridas />;
        case "sec-rota": return <VisualRota />;
        case "sec-cadastrar-motorista":
            return <VisualFormulario campos={["Nome", "CPF", "Data de nascimento", "CNH", "Telefone", "E-mail"]} />;
        case "sec-cadastrar-idoso":
            return <VisualFormulario campos={["Nome", "CPF", "Data de nascimento", "Telefone", "E-mail", "Contato de emergência"]} />;
        case "sec-relacionar": return <VisualRelacionar />;
        case "sec-dados-sistema": return <VisualDados />;
        case "sec-historico": return <VisualHistorico />;
        default: return null;
    }
}

function CartaoFuncionalidade({ pagina, expandido, onToggleExpandir }) {
    const [hover, setHover] = useState(false);

    const cardStyle = {
        background: "linear-gradient(175deg, #1a1f2a 0%, #151922 100%)",
        border: "1px solid " + (hover ? "#5a6473" : "#2d3340"),
        boxShadow: hover ? "0 14px 36px rgba(0,0,0,0.45)" : "0 6px 20px rgba(0,0,0,0.25)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s ease",
    };

    return (
        <section
            id={pagina.sectionId}
            className="card shadow-sm text-start"
            style={cardStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-2">
                    <div style={{
                        width: 60, height: 60,
                        borderRadius: 12,
                        background: "linear-gradient(180deg, #232733 0%, #161a23 100%)",
                        border: "1px solid #3a4250",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <IconePorSecao sectionId={pagina.sectionId} />
                    </div>
                    <div className="flex-grow-1">
                        <h3 className="h6 mb-1" style={{ color: "#000000" }}>{pagina.titulo}</h3>
                        <p className="small mb-0" style={{ color: "#000000" }}>{pagina.descricao}</p>
                    </div>
                </div>

                <ul className="mb-3 mt-3" style={{ color: "#dde3ee" }}>
                    {pagina.detalhes.map((detalhe) => (
                        <li key={detalhe} style={{ marginBottom: 4 }}>{detalhe}</li>
                    ))}
                </ul>

                <VisualPorSecao sectionId={pagina.sectionId} />

                <button
                    type="button"
                    className="btn btn-sm mt-3"
                    style={{
                        background: "transparent",
                        border: "1px solid #5a6473",
                        color: "#dde3ee",
                    }}
                    onClick={onToggleExpandir}
                    aria-expanded={expandido}
                >
                    {expandido ? "Ocultar como funciona" : "Mostrar como funciona"}
                </button>

                {expandido && (
                    <div
                        className="mt-3 p-3 rounded"
                        style={{
                            background: "#0f1319",
                            border: "1px solid #2a3140",
                            color: "#dde3ee",
                        }}
                    >
                        {pagina.comoFunciona}
                    </div>
                )}
            </div>
        </section>
    );
}

function InicioPage({ isAuthenticated }) {
    const location = useLocation();
    const [expandidos, setExpandidos] = useState({});

    useEffect(() => {
        const sectionId = location.state?.scrollTo;
        if (!sectionId) return;

        const scroll = () => {
            if (sectionId === "sec-inicio") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        const timeoutId = window.setTimeout(scroll, 80);
        return () => window.clearTimeout(timeoutId);
    }, [location.key, location.state]);

    const COR_TITULO = { color: "#ffffff" };
    const COR_DESCRICAO = { color: "#ffffff" };
    const COR_PRETO = { color: "#000000" };

    function toggleExpandido(sectionId) {
        setExpandidos((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    }

    return (
        <div className="inicio-page" id="sec-inicio">
            <div className="mb-4">
                <h1 className="mb-3" style={COR_TITULO}>Transenior</h1>
                <p className="lead" style={COR_DESCRICAO}>
                    Sistema de gestão de transporte para idosos. Permite cadastrar motoristas e idosos,
                    relacionar quem atende quem, criar e acompanhar corridas e visualizar rotas no mapa.
                </p>
                {!isAuthenticated && (
                    <p className="small mb-0" style={COR_DESCRICAO}>
                        Você está no modo informativo. Use o menu do topo para navegar pelas explicações de cada funcionalidade.
                    </p>
                )}
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h2 className="h5 card-title mb-3" style={COR_PRETO}>O que o sistema faz?</h2>
                    <ul className="mb-0">
                        <li>Cadastro de <strong>motoristas</strong> e <strong>idosos</strong> com endereços e dados de contato.</li>
                        <li>Definição de <strong>relacionamentos</strong> entre motorista e idoso para viabilizar corridas.</li>
                        <li>Gestão de <strong>corridas</strong>: solicitar, iniciar, acompanhar no mapa e finalizar.</li>
                        <li>Visualização da <strong>rota no mapa</strong> com animação do trajeto do veículo.</li>
                        <li>Consulta de <strong>dados</strong> e <strong>histórico</strong> de alterações.</li>
                    </ul>
                </div>
            </div>

            {!isAuthenticated && (
                <div className="mt-4">
                    <h2 className="h5 mb-3" style={COR_TITULO}>Detalhamento das funcionalidades</h2>
                    <div className="d-grid gap-3">
                        {paginas.map((p) => (
                            <CartaoFuncionalidade
                                key={p.sectionId}
                                pagina={p}
                                expandido={!!expandidos[p.sectionId]}
                                onToggleExpandir={() => toggleExpandido(p.sectionId)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InicioPage;
