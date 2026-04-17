package com.idoso.uber.domain.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "idosos")
@SequenceGenerator(name = "idoso_seq", sequenceName = "idoso_seq", allocationSize = 1)
public class Idoso extends Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "idoso_seq")
    private Long id;

    private String contatoEmergencia;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "id_origem")
    private Endereco enderecoOrigem;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "id_destino")
    private Endereco enderecoDestino;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContatoEmergencia() {
        return contatoEmergencia;
    }

    public void setContatoEmergencia(String contatoEmergencia) {
        this.contatoEmergencia = contatoEmergencia;
    }
    public Endereco getEnderecoOrigem() {
        return enderecoOrigem;
    }

    public void setEnderecoOrigem(Endereco enderecoOrigem) {
        this.enderecoOrigem = enderecoOrigem;
    }

    public Endereco getEnderecoDestino() {
        return enderecoDestino;
    }

    public void setEnderecoDestino(Endereco enderecoDestino) {
        this.enderecoDestino = enderecoDestino;
    }
}
