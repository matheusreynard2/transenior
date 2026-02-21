export interface CorridaModalData {
    corridaId: number;
    enderecoOrigem: string;
    enderecoDestino: string;
    onFinalizar?: () => void;
}

export interface CorridaEmAndamentoContextValue {
    corridaModal: CorridaModalData | null;
    openCorridaModal: (data: CorridaModalData) => void;
    closeCorridaModal: () => void;
    corridaEmAndamentoId: number | null;
}

export function useCorridaEmAndamento(): CorridaEmAndamentoContextValue;
export function CorridaEmAndamentoProvider(props: { children: React.ReactNode }): JSX.Element;
