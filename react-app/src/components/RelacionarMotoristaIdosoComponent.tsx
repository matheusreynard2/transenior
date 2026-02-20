import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";

interface PessoaBase {
    id: number;
    nome: string;
}

function RelacionarMotoristaIdosoComponent() {
    const [motoristas, setMotoristas] = useState<PessoaBase[]>([]);
    const [idosos, setIdosos] = useState<PessoaBase[]>([]);
    const [motoristaId, setMotoristaId] = useState<string>("");
    const [idosoId, setIdosoId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [tipoMensagem, setTipoMensagem] = useState<"success" | "warning" | "error">("success");

    const carregarListas = async () => {
        setLoading(true);
        setMensagem(null);
        try {
            const [motoristasResponse, idososResponse] = await Promise.all([
                axios.get(`${API_BASE}/motoristas`),
                axios.get(`${API_BASE}/idosos`)
            ]);
            setMotoristas(motoristasResponse.data || []);
            setIdosos(idososResponse.data || []);
        } catch (error) {
            setMensagem("Erro ao carregar motoristas e idosos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarListas();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMensagem(null);
        setLoading(true);

        try {
            await axios.post(`${API_BASE}/relacionamentos`, {
                motoristaId: Number(motoristaId),
                idosoId: Number(idosoId)
            });
            setTipoMensagem("success");
            setMensagem("Relacionamento criado com sucesso.");
            setMotoristaId("");
            setIdosoId("");
        } catch (err: unknown) {
            const res = err && typeof err === "object" && "response" in err
                ? (err as { response?: { status?: number; data?: { mensagem?: string } } }).response
                : null;
            const status = res?.status;
            const msgBackend = res?.data?.mensagem;
            if (status === 409) {
                setTipoMensagem("warning");
                setMensagem(msgBackend && msgBackend.trim() ? msgBackend : "Já existe o relacionamento entre este motorista e este idoso.");
            } else {
                setTipoMensagem("error");
                setMensagem("Erro ao criar relacionamento.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2 className="mb-4">Relacionar Motorista e Idoso</h2>
            {mensagem && (
                <div className={`alert ${tipoMensagem === "success" ? "alert-success" : tipoMensagem === "warning" ? "alert-warning" : "alert-danger"}`}>
                    {mensagem}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Motorista:</label>
                        <select
                            className="form-select"
                            value={motoristaId}
                            onChange={(e) => setMotoristaId(e.target.value)}
                            disabled={loading || motoristas.length === 0}
                            required
                        >
                            <option value="">Selecione o motorista</option>
                            {motoristas.map((motorista) => (
                                <option key={motorista.id} value={motorista.id}>
                                    {motorista.nome} (ID {motorista.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Idoso:</label>
                        <select
                            className="form-select"
                            value={idosoId}
                            onChange={(e) => setIdosoId(e.target.value)}
                            disabled={loading || idosos.length === 0}
                            required
                        >
                            <option value="">Selecione o idoso</option>
                            {idosos.map((idoso) => (
                                <option key={idoso.id} value={idoso.id}>
                                    {idoso.nome} (ID {idoso.id})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !motoristaId || !idosoId}
                >
                    Relacionar
                </button>
            </form>
            {loading && <div className="loading-footer">Carregando...</div>}
        </div>
    );
}

export default RelacionarMotoristaIdosoComponent;
