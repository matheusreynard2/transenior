export const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
];

export const fetchCidades = async (uf: string): Promise<{ id: number; nome: string }[]> => {
    if (!uf) return [];
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`;
    const response = await fetch(url);
    const data = await response.json();
    return data.map((c: { id: number; nome: string }) => ({ id: c.id, nome: c.nome }));
};

/** Tipo de endereço retornado pela API. */
export interface Endereco {
    id: number;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
    corridaId?: number | null;
}

/** Formulário de endereço (origem/destino) para cadastro. */
export interface EnderecoForm {
    id?: number;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
}

export const enderecoVazio = (): EnderecoForm => ({
    id: 0,
    logradouro: "",
    numero: "",
    estado: "",
    cidade: "",
});

export type EnderecoPayload = {
    logradouro: string | null;
    numero: string | null;
    estado: string | null;
    cidade: string | null;
};

export function enderecoParaPayload(e: EnderecoForm): EnderecoPayload | undefined {
    const hasAny = e.logradouro || e.numero || e.estado || e.cidade;
    if (!hasAny) return undefined;
    return {
        logradouro: e.logradouro || null,
        numero: e.numero || null,
        estado: e.estado || null,
        cidade: e.cidade || null,
    };
}

export function enderecoParaForm(e: Endereco): EnderecoForm {
    return {
        id: e.id,
        logradouro: e.logradouro,
        numero: e.numero,
        estado: e.estado,
        cidade: e.cidade,
    };
}
