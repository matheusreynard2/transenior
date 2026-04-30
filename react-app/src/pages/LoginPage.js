import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { realizarLogin } from "../services/loginService";

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

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
      const response = await realizarLogin({
        email: emailLimpo,
        senha: senhaLimpa,
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas.");
      }

      const usuario = await response.json();
      onLoginSuccess(usuario);
      navigate("/inicio", { replace: true });
    } catch (e) {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
      <div className="card shadow-sm" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body text-start">
          <h2 className="h4 mb-3 text-center">Login</h2>
          <p className="text-muted small mb-4 text-center">
            Acesse o sistema com o e-mail e senha cadastrados no banco de dados.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
