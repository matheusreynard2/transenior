import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './navBar.css';

function NavBar({ isAuthenticated, usuarioLogado, onLogout, onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const menuItems = [
        { label: "Início", path: "/inicio", sectionId: "sec-inicio" },
        { label: "Corridas", path: "/listarTodosCorridas", sectionId: "sec-corridas" },
        { label: "Rota da Corrida", path: "/rotaCorrida", sectionId: "sec-rota" },
        { label: "Cadastrar Motorista", path: "/cadastrarMotorista", sectionId: "sec-cadastrar-motorista" },
        { label: "Cadastrar Idoso", path: "/cadastrarIdoso", sectionId: "sec-cadastrar-idoso" },
        { label: "Relacionar Motorista/Idoso", path: "/relacionarMotoristaIdoso", sectionId: "sec-relacionar" },
        { label: "Dados do sistema", path: "/listarTodosDados", sectionId: "sec-dados-sistema" },
        { label: "Histórico", path: "/historico", sectionId: "sec-historico" },
    ];

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");

        const emailLimpo = email.trim();
        const senhaLimpa = senha.trim();
        if (!emailLimpo || !senhaLimpa) {
            setErro("Informe e-mail e senha.");
            return;
        }

        setCarregando(true);
        try {
            const result = await onLogin({ email: emailLimpo, senha: senhaLimpa });
            if (!result?.ok) {
                setErro(result?.message || "Falha no login.");
                return;
            }
            setEmail("");
            setSenha("");
            setErro("");
        } catch (e) {
            setErro("Falha ao tentar login.");
        } finally {
            setCarregando(false);
        }
    }

    function scrollToSection(sectionId) {
        if (sectionId === "sec-inicio") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function handleInfoMenuClick(sectionId) {
        if (location.pathname !== "/inicio") {
            navigate("/inicio", { state: { scrollTo: sectionId } });
            return;
        }
        scrollToSection(sectionId);
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/inicio">Transenior</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isAuthenticated ? "" : "navbar-collapse-public"}`.trim()} id="navbarNavAltMarkup">
                    <div className={`navbar-nav ${isAuthenticated ? "" : "navbar-nav-public"}`.trim()}>
                        {menuItems.map((item) =>
                            isAuthenticated ? (
                                <Link key={item.path} className="nav-link" to={item.path}>
                                    {item.label}
                                </Link>
                            ) : (
                                <button
                                    key={item.path}
                                    type="button"
                                    className="nav-link nav-link-button nav-link-button-public"
                                    onClick={() => handleInfoMenuClick(item.sectionId)}
                                >
                                    {item.label}
                                </button>
                            )
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className="ms-auto d-flex align-items-center gap-2">
                            <span className="navbar-text text-light small">
                                {usuarioLogado?.email ? `Logado: ${usuarioLogado.email}` : "Logado"}
                            </span>
                            <button type="button" className="btn btn-outline-light btn-sm" onClick={onLogout}>
                                Sair
                            </button>
                        </div>
                    ) : (
                        <form className="ms-auto d-flex flex-column align-items-end navbar-login-wrap navbar-login-wrap-public" onSubmit={handleSubmit}>
                            <div className="d-flex gap-2 navbar-login-fields">
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                                <input
                                    type="password"
                                    className="form-control form-control-sm"
                                    placeholder="Senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button type="submit" className="btn btn-primary btn-sm" disabled={carregando}>
                                    {carregando ? "Entrando..." : "Entrar"}
                                </button>
                            </div>
                            {erro && <small className="text-warning mt-1">{erro}</small>}
                        </form>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;