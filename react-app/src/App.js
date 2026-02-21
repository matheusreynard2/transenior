import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

function AppContent() {
  const location = useLocation();
  const isInicio = location.pathname === "/inicio" || location.pathname === "/";
  return (
      <div className="container app-container" style={{marginTop: "80px", marginBottom: "20px"}}>
          {!isInicio && <h1 style={{textAlign: "center"}}>Bem-vindo</h1>}
          <div className="content">
              <Routes>
                  <Route path="/" element={<Navigate to="/inicio" replace />} />
                  <Route path="/inicio" element={<InicioPage/>}/>
                  <Route path="/cadastrarMotorista" element={<CadastrarMotoristaPage/>}/>
                  <Route path="/cadastrarIdoso" element={<CadastrarIdosoPage/>}/>
                  <Route path="/relacionarMotoristaIdoso" element={<RelacionarMotoristaIdosoPage/>}/>
                  <Route path="/listarTodosCorridas" element={<ListarTodosCorridasPage/>}/>
                  <Route path="/rotaCorrida" element={<RotaCorridaPage/>}/>
                  <Route path="/listarTodosDados" element={<ListarTodosDadosPage/>}/>
                  <Route path="/historico" element={<HistoricoPage/>}/>
              </Routes>
          </div>
          <JanelaCorridaEmAndamento />
      </div>
  );
}

function App() {
  return (
      <Router>
          <CorridaEmAndamentoProvider>
              <NavBar/>
              <AppContent />
          </CorridaEmAndamentoProvider>
      </Router>
  );
}

export default App;