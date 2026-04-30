import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const paginas = [
    {
        sectionId: "sec-corridas",
        titulo: "Corridas",
        path: "/listarTodosCorridas",
        descricao: "Central de operação das corridas, com status, horários e ações de gerenciamento em tempo real.",
        detalhes: [
            "Mostra a lista completa de corridas com origem, destino, motorista, idoso e estado atual.",
            "Permite iniciar, finalizar, cancelar e editar corridas com atualização imediata dos dados.",
            "Suporta exclusão individual e também ações em lote para facilitar manutenção operacional.",
            "Quando logado, integra com o fluxo de navegação para a rota da corrida em andamento."
        ],
        desenho: "desenho-corrida"
    },
    {
        sectionId: "sec-rota",
        titulo: "Rota da Corrida",
        path: "/rotaCorrida",
        descricao: "Visualização de rota no mapa para acompanhar deslocamento entre origem e destino.",
        detalhes: [
            "Traça automaticamente o caminho com base nos endereços informados no sistema.",
            "Apresenta o percurso no mapa para facilitar validação e acompanhamento da viagem.",
            "Permite iniciar o deslocamento visual e acompanhar a execução da corrida.",
            "Integra com a etapa de finalização, com tempo percorrido e atualização de status."
        ],
        desenho: "desenho-rota"
    },
    {
        sectionId: "sec-cadastrar-motorista",
        titulo: "Cadastrar Motorista",
        path: "/cadastrarMotorista",
        descricao: "Formulário completo para registrar motoristas com dados pessoais e profissionais.",
        detalhes: [
            "Registra identificação, contato e data de nascimento para cadastro completo do perfil.",
            "Armazena informações profissionais relevantes para atuação no serviço.",
            "Permite definir disponibilidade e dados de operação para uso nas corridas.",
            "Após cadastro, o motorista pode ser relacionado a idosos e participar do fluxo de corridas."
        ],
        desenho: "desenho-motorista"
    },
    {
        sectionId: "sec-cadastrar-idoso",
        titulo: "Cadastrar Idoso",
        path: "/cadastrarIdoso",
        descricao: "Cadastro de idosos com dados essenciais para atendimento e deslocamento seguro.",
        detalhes: [
            "Coleta dados pessoais, contato principal e informações importantes para atendimento.",
            "Permite registrar contato de emergência para reforçar segurança durante o uso.",
            "Define endereços de origem e destino para apoiar criação de corridas futuras.",
            "Mantém os dados disponíveis para relacionamento com motoristas autorizados."
        ],
        desenho: "desenho-idoso"
    },
    {
        sectionId: "sec-relacionar",
        titulo: "Relacionar Motorista/Idoso",
        path: "/relacionarMotoristaIdoso",
        descricao: "Módulo que estabelece os vínculos de atendimento entre motoristas e idosos.",
        detalhes: [
            "Cria vínculos entre entidades já cadastradas para formar pares válidos de atendimento.",
            "Define claramente quais combinações podem gerar corridas no sistema.",
            "Reduz erros operacionais ao restringir solicitações a relacionamentos autorizados.",
            "Apoia o gerenciamento da base ativa de atendimento com mais controle."
        ],
        desenho: "desenho-relacionamento"
    },
    {
        sectionId: "sec-dados-sistema",
        titulo: "Dados do sistema",
        path: "/listarTodosDados",
        descricao: "Painel consolidado para consulta ampla de cadastros e relacionamentos do sistema.",
        detalhes: [
            "Reúne em uma única visão os cadastros de motoristas, idosos e endereços.",
            "Exibe relacionamentos ativos para facilitar auditoria e conferência de consistência.",
            "Ajuda na validação dos dados antes de novas operações ou ajustes.",
            "Serve como tela de apoio para gestão administrativa e suporte."
        ],
        desenho: "desenho-dados"
    },
    {
        sectionId: "sec-historico",
        titulo: "Histórico",
        path: "/historico",
        descricao: "Registro cronológico das operações realizadas para rastreabilidade completa.",
        detalhes: [
            "Exibe eventos de cadastro, atualização, troca de status e remoção de dados.",
            "Organiza as ações em sequência temporal para facilitar investigação de ocorrências.",
            "Aumenta a transparência operacional com rastreabilidade das atividades.",
            "Apoia auditoria interna e conferência de ações executadas no sistema."
        ],
        desenho: "desenho-historico"
    },
];

function DesenhoInformativo({ tipo }) {
    return (
        <div className={`desenho-informativo ${tipo}`} aria-hidden="true">
            <span className="shape shape-1"></span>
            <span className="shape shape-2"></span>
            <span className="shape shape-3"></span>
        </div>
    );
}

function InicioPage({ isAuthenticated }) {
    const location = useLocation();

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

    return (
        <div className="inicio-page" id="sec-inicio">
            <div className="mb-4">
                <h1 className="mb-3">Transenior</h1>
                <p className="lead text-muted">
                    Sistema de gestão de transporte para idosos. Permite cadastrar motoristas e idosos,
                    relacionar quem atende quem, criar e acompanhar corridas e visualizar rotas no mapa.
                </p>
                {!isAuthenticated && (
                    <p className="small text-muted mb-0">
                        Você está no modo informativo. Use o menu do topo para navegar pelas explicações de cada funcionalidade.
                    </p>
                )}
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h2 className="h5 card-title mb-3">O que o sistema faz?</h2>
                    <ul className="mb-0">
                        <li>Cadastro de <strong>motoristas</strong> e <strong>idosos</strong> com endereços e dados de contato.</li>
                        <li>Definição de <strong>relacionamentos</strong> entre motorista e idoso para viabilizar corridas.</li>
                        <li>Gestão de <strong>corridas</strong>: solicitar, iniciar, acompanhar no mapa e finalizar.</li>
                        <li>Visualização da <strong>rota no mapa</strong> com animação do trajeto do veículo.</li>
                        <li>Consulta de <strong>dados</strong> e <strong>histórico</strong> de alterações.</li>
                    </ul>
                </div>
            </div>

            <h2 className="h5 mb-3">Funcionalidade de cada página</h2>
            <div className="row g-3">
                {paginas.map((p) => (
                    <div key={p.path} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm info-card-resumo">
                            <div className="card-body">
                                {!isAuthenticated && <DesenhoInformativo tipo={p.desenho} />}
                                <h3 className="h6 card-title">{p.titulo}</h3>
                                <p className="card-text small text-muted mb-0">{p.descricao}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isAuthenticated && (
                <div className="mt-4">
                    <h2 className="h5 mb-3">Detalhamento das funcionalidades</h2>
                    <div className="d-grid gap-3">
                        {paginas.map((p) => (
                            <section key={p.sectionId} id={p.sectionId} className="card shadow-sm text-start info-card-detalhe">
                                <div className="card-body">
                                    <DesenhoInformativo tipo={p.desenho} />
                                    <h3 className="h6">{p.titulo}</h3>
                                    <p className="text-muted small">{p.descricao}</p>
                                    <ul className="mb-0">
                                        {p.detalhes.map((detalhe) => (
                                            <li key={detalhe}>{detalhe}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InicioPage;
