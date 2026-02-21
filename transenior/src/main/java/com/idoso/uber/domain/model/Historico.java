package com.idoso.uber.domain.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico")
@SequenceGenerator(name = "historico_seq", sequenceName = "historico_seq", allocationSize = 1)
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "historico_seq")
    private Long id;

    @Column(nullable = false)
    private String tipoAcao;

    @Column(nullable = false)
    private String entidadeAfetada;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    public Historico() {
        this.dataHora = LocalDateTime.now();
    }

    public Historico(String tipoAcao, String entidadeAfetada, String descricao) {
        this();
        this.tipoAcao = tipoAcao;
        this.entidadeAfetada = entidadeAfetada;
        this.descricao = descricao;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipoAcao() { return tipoAcao; }
    public void setTipoAcao(String tipoAcao) { this.tipoAcao = tipoAcao; }
    public String getEntidadeAfetada() { return entidadeAfetada; }
    public void setEntidadeAfetada(String entidadeAfetada) { this.entidadeAfetada = entidadeAfetada; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}
