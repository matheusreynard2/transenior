import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCorridaEmAndamento } from "../contexts/CorridaEmAndamentoContext.jsx";
import MapaRotaComponent from "../components/MapaRotaComponent";

function RotaCorridaPage() {
    const location = useLocation();
    const state = location.state || {};
    const { ensureCorridaAtiva, activeCorrida } = useCorridaEmAndamento();
    const fromContext = activeCorrida && !state.corridaId ? activeCorrida : null;
    const corridaId = state.corridaId ?? fromContext?.corridaId;
    const enderecoOrigem = state.enderecoOrigem ?? fromContext?.enderecoOrigem ?? "";
    const enderecoDestino = state.enderecoDestino ?? fromContext?.enderecoDestino ?? "";

    useEffect(() => {
        if (corridaId && enderecoOrigem && enderecoDestino) {
            ensureCorridaAtiva({ corridaId, enderecoOrigem, enderecoDestino });
        }
    }, [corridaId, enderecoOrigem, enderecoDestino, ensureCorridaAtiva]);

    return (
        <div>
            <h2 className="mb-3 px-2">Rota da corrida</h2>
            <p className="text-muted px-2 mb-3">
                Informe o endereço inicial e final para traçar o caminho no mapa. Esta página apenas exibe a rota; para iniciar e finalizar uma corrida, use a lista de corridas e a janela que abre ao clicar em &quot;Iniciar&quot;.
            </p>
            <MapaRotaComponent
                initialEnderecoOrigem={enderecoOrigem}
                initialEnderecoDestino={enderecoDestino}
                corridaId={corridaId}
                somenteRota={true}
            />
        </div>
    );
}

export default RotaCorridaPage;
