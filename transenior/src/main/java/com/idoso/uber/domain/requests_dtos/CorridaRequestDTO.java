package com.idoso.uber.domain.requests_dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CorridaRequestDTO {
    private Long idosoId;
    private Long motoristaId;
    private Long origemId;
    private Long destinoId;
    private String statusCorrida;
    private LocalDateTime dataHoraSolicitacao;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private BigDecimal valorTotal;
    private BigDecimal valorCorrida;
    private BigDecimal valorComissao;
    private Double percentualComissao;
    /** Se true, ao finalizar pela tabela de corridas, zera o tempo total (dataHoraFim = dataHoraInicio). */
    private Boolean finalizarPelaTabela;
    /** Duração em segundos ao finalizar pela janela; o backend define dataHoraFim = dataHoraInicio + este valor. */
    private Long duracaoSegundos;

    public Long getIdosoId() { return idosoId; }
    public void setIdosoId(Long idosoId) { this.idosoId = idosoId; }
    public Long getMotoristaId() { return motoristaId; }
    public void setMotoristaId(Long motoristaId) { this.motoristaId = motoristaId; }
    public Long getOrigemId() { return origemId; }
    public void setOrigemId(Long origemId) { this.origemId = origemId; }
    public Long getDestinoId() { return destinoId; }
    public void setDestinoId(Long destinoId) { this.destinoId = destinoId; }
    public String getStatusCorrida() { return statusCorrida; }
    public void setStatusCorrida(String statusCorrida) { this.statusCorrida = statusCorrida; }
    public LocalDateTime getDataHoraSolicitacao() { return dataHoraSolicitacao; }
    public void setDataHoraSolicitacao(LocalDateTime dataHoraSolicitacao) { this.dataHoraSolicitacao = dataHoraSolicitacao; }
    public LocalDateTime getDataHoraInicio() { return dataHoraInicio; }
    public void setDataHoraInicio(LocalDateTime dataHoraInicio) { this.dataHoraInicio = dataHoraInicio; }
    public LocalDateTime getDataHoraFim() { return dataHoraFim; }
    public void setDataHoraFim(LocalDateTime dataHoraFim) { this.dataHoraFim = dataHoraFim; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public BigDecimal getValorCorrida() { return valorCorrida; }
    public void setValorCorrida(BigDecimal valorCorrida) { this.valorCorrida = valorCorrida; }
    public BigDecimal getValorComissao() { return valorComissao; }
    public void setValorComissao(BigDecimal valorComissao) { this.valorComissao = valorComissao; }
    public Double getPercentualComissao() { return percentualComissao; }
    public void setPercentualComissao(Double percentualComissao) { this.percentualComissao = percentualComissao; }
    public Boolean getFinalizarPelaTabela() { return finalizarPelaTabela; }
    public void setFinalizarPelaTabela(Boolean finalizarPelaTabela) { this.finalizarPelaTabela = finalizarPelaTabela; }
    public Long getDuracaoSegundos() { return duracaoSegundos; }
    public void setDuracaoSegundos(Long duracaoSegundos) { this.duracaoSegundos = duracaoSegundos; }
}
