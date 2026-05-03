import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/navBar.js";
import InicioPage from "./pages/InicioPage.js";
import ListarTodosCorridasPage from "./pages/ListarTodosCorridasPage.js";
import RotaCorridaPage from "./pages/RotaCorridaPage.js";
import CadastrarMotoristaPage from "./pages/CadastrarMotoristaPage.js";
import CadastrarIdosoPage from "./pages/CadastrarIdosoPage.js";
import RelacionarMotoristaIdosoPage from "./pages/RelacionarMotoristaIdosoPage.js";
import ListarTodosDadosPage from "./pages/ListarTodosDadosPage.js";
import HistoricoPage from "./pages/HistoricoPage.js";
import { CorridaEmAndamentoProvider } from "./contexts/CorridaEmAndamentoContext.jsx";
import JanelaCorridaEmAndamento from "./components/JanelaCorridaEmAndamento.jsx";
import { realizarLogin } from "./services/loginService";

const AUTH_FLAG_KEY = "transenior.isAuthenticated";
const AUTH_USER_KEY = "transenior.authUser";

function ProtectedRoute({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }
  return <Outlet />;
}

function AppContent({ isAuthenticated }) {
  return (
      <div className="container app-container" style={{marginTop: "80px", marginBottom: "20px"}}>
          <div className="content">
              <Routes>
                  <Route path="/" element={<Navigate to="/inicio" replace />} />
                  <Route path="/inicio" element={<InicioPage isAuthenticated={isAuthenticated} />} />
                  <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    <Route path="/cadastrarMotorista" element={<CadastrarMotoristaPage/>}/>
                    <Route path="/cadastrarIdoso" element={<CadastrarIdosoPage/>}/>
                    <Route path="/relacionarMotoristaIdoso" element={<RelacionarMotoristaIdosoPage/>}/>
                    <Route path="/listarTodosCorridas" element={<ListarTodosCorridasPage/>}/>
                    <Route path="/rotaCorrida" element={<RotaCorridaPage/>}/>
                    <Route path="/listarTodosDados" element={<ListarTodosDadosPage/>}/>
                    <Route path="/historico" element={<HistoricoPage/>}/>
                  </Route>
                  <Route path="*" element={<Navigate to="/inicio" replace />} />
              </Routes>
          </div>
          {isAuthenticated && <JanelaCorridaEmAndamento />}
      </div>
  );
}

function App() {
  const initialAuthUser = useMemo(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(AUTH_FLAG_KEY) === "true");
  const [usuarioLogado, setUsuarioLogado] = useState(initialAuthUser);

  function handleLoginSuccess(usuario) {
    setIsAuthenticated(true);
    setUsuarioLogado(usuario || null);
    localStorage.setItem(AUTH_FLAG_KEY, "true");
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario || null));
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setUsuarioLogado(null);
    localStorage.removeItem(AUTH_FLAG_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  async function handleLogin({ email, senha }) {
    const response = await realizarLogin({ email, senha });
    if (!response.ok) {
      return { ok: false, message: "E-mail ou senha inválidos." };
    }

    const usuario = await response.json();
    handleLoginSuccess(usuario);
    return { ok: true };
  }

  return (
      <Router>
          <CorridaEmAndamentoProvider>
              <NavBar
                isAuthenticated={isAuthenticated}
                usuarioLogado={usuarioLogado}
                onLogout={handleLogout}
                onLogin={handleLogin}
              />
              <AppContent isAuthenticated={isAuthenticated} />
          </CorridaEmAndamentoProvider>
      </Router>
  );
}

export default App;