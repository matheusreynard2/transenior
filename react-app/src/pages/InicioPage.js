import React from "react";
import { Link } from "react-router-dom";

const paginas = [
    {
        titulo: "Corridas",
        path: "/listarTodosCorridas",
        descricao: "Lista todas as corridas do sistema. Permite visualizar idoso, motorista, endereços de origem e destino, status e data. Você pode iniciar uma corrida (abre a rota no mapa), finalizar, cancelar, editar ou excluir corridas, individualmente ou em lote.",
    },
    {
        titulo: "Rota da Corrida",
        path: "/rotaCorrida",
        descricao: "Exibe um mapa com a rota entre dois endereços. Informe o endereço inicial e final para traçar o caminho. É possível iniciar a animação do veículo percorrendo a rota. Ao chegar ao destino, um modal mostra o tempo da corrida e permite finalizá-la. Ao clicar em \"Iniciar\" na página de Corridas, você é levado aqui com a rota já definida e a corrida inicia automaticamente.",
    },
    {
        titulo: "Cadastrar Motorista",
        path: "/cadastrarMotorista",
        descricao: "Formulário para cadastrar um novo motorista no sistema. Inclui dados pessoais (nome, CPF, data de nascimento, telefone, e-mail), CNH, COREN, serviços oferecidos, disponibilidade e endereços de origem e destino de atuação.",
    },
    {
        titulo: "Cadastrar Idoso",
        path: "/cadastrarIdoso",
        descricao: "Formulário para cadastrar um novo idoso. Inclui dados pessoais (nome, CPF, data de nascimento, telefone, e-mail), contato de emergência e endereços de origem e destino para as corridas.",
    },
    {
        titulo: "Relacionar Motorista/Idoso",
        path: "/relacionarMotoristaIdoso",
        descricao: "Define quais motoristas atendem quais idosos. Ao criar um relacionamento, o sistema pode gerar corridas associando esse par. Essas corridas aparecem na lista de Corridas para serem gerenciadas.",
    },
    {
        titulo: "Dados do sistema",
        path: "/listarTodosDados",
        descricao: "Visualização consolidada de todos os dados cadastrados: motoristas, idosos, endereços e relacionamentos entre motoristas e idosos. Útil para consulta e conferência do conteúdo do sistema.",
    },
    {
        titulo: "Histórico",
        path: "/historico",
        descricao: "Registro das ações realizadas no sistema, como cadastros, atualizações, exclusões e mudanças de status. Permite acompanhar o que foi alterado e quando.",
    },
];

function InicioPage() {
    return (
        <div className="inicio-page">
            <div className="mb-4">
                <h1 className="mb-3">Transenior</h1>
                <p className="lead text-muted">
                    Sistema de gestão de transporte para idosos. Permite cadastrar motoristas e idosos,
                    relacionar quem atende quem, criar e acompanhar corridas e visualizar rotas no mapa.
                </p>
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
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h3 className="h6 card-title">
                                    <Link to={p.path} className="text-decoration-none">
                                        {p.titulo}
                                    </Link>
                                </h3>
                                <p className="card-text small text-muted mb-0">{p.descricao}</p>
                                <Link to={p.path} className="btn btn-sm btn-outline-primary mt-2">
                                    Acessar
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InicioPage;
