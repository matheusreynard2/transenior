package com.idoso.uber.domain.requests_dtos;

public class RoteamentoRequestDTO {
    private String origem;
    private String destino;

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }
}
