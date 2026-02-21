import type { Endereco, EnderecoForm } from "./endereco";

export interface Corrida {
    id: number;
    idoso: Idoso | null;
    motorista: Motorista | null;
    origem: EnderecoForm | null;
    destino: EnderecoForm | null;
    statusCorrida: string;
    dataHoraSolicitacao: string;
    /** Preenchido quando status passa a EM_ANDAMENTO (ISO string). */
    dataHoraInicio?: string | null;
    /** Preenchido quando status passa a FINALIZADA (ISO string). */
    dataHoraFim?: string | null;
}

export interface Usuario {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    telefone: string;
    email: string;
    ativo: boolean;
}

export interface Idoso extends Usuario {
    contatoEmergencia: string | null;
    corridaId: number | null;
}

export interface Motorista extends Usuario {
    cnh: string;
    coren: string;
    servicos: string;
    disponivel: boolean;
    aprovado: boolean;
    corridaId: number | null;
}

/** Cadastro na tabela relacionamento_motorista_idoso (par motorista-idoso). */
export interface RelacionamentoMotoristaIdoso {
    id: number;
    motorista: Motorista | null;
    idoso: Idoso | null;
}
