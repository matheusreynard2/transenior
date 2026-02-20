import React from "react";
import { Link } from "react-router-dom";
import './navBar.css';

function NavBar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/inicio">Transenior</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link className="nav-link" to="/inicio">Início</Link>
                        <Link className="nav-link" to="/listarTodosCorridas">Corridas</Link>
                        <Link className="nav-link" to="/rotaCorrida">Rota da Corrida</Link>
                        <Link className="nav-link" to="/cadastrarMotorista">Cadastrar Motorista</Link>
                        <Link className="nav-link" to="/cadastrarIdoso">Cadastrar Idoso</Link>
                        <Link className="nav-link" to="/relacionarMotoristaIdoso">Relacionar Motorista/Idoso</Link>
                        <Link className="nav-link" to="/listarTodosDados">Dados do sistema</Link>
                        <Link className="nav-link" to="/historico">Histórico</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;