package com.idoso.uber.domain.requests_dtos;

public class RelacionamentoRequestDTO {
    private Long motoristaId;
    private Long idosoId;

    public Long getMotoristaId() {
        return motoristaId;
    }

    public void setMotoristaId(Long motoristaId) {
        this.motoristaId = motoristaId;
    }

    public Long getIdosoId() {
        return idosoId;
    }

    public void setIdosoId(Long idosoId) {
        this.idosoId = idosoId;
    }
}
