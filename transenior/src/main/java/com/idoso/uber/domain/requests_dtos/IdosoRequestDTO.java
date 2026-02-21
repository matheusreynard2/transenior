package com.idoso.uber.domain.requests_dtos;

import java.time.LocalDate;

public class IdosoRequestDTO {
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    private boolean ativo;
    private String contatoEmergencia;
    private Long enderecoOrigemId;
    private Long enderecoDestinoId;
    /** Opcional: criar endereço de origem a partir do body (frontend envia como DTO). */
    private EnderecoRequestDTO enderecoOrigem;
    /** Opcional: criar endereço de destino a partir do body (frontend envia como DTO). */
    private EnderecoRequestDTO enderecoDestino;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public String getContatoEmergencia() {
        return contatoEmergencia;
    }

    public void setContatoEmergencia(String contatoEmergencia) {
        this.contatoEmergencia = contatoEmergencia;
    }

    public Long getEnderecoOrigemId() {
        return enderecoOrigemId;
    }

    public void setEnderecoOrigemId(Long enderecoOrigemId) {
        this.enderecoOrigemId = enderecoOrigemId;
    }

    public Long getEnderecoDestinoId() {
        return enderecoDestinoId;
    }

    public void setEnderecoDestinoId(Long enderecoDestinoId) {
        this.enderecoDestinoId = enderecoDestinoId;
    }

    public EnderecoRequestDTO getEnderecoOrigem() {
        return enderecoOrigem;
    }

    public void setEnderecoOrigem(EnderecoRequestDTO enderecoOrigem) {
        this.enderecoOrigem = enderecoOrigem;
    }

    public EnderecoRequestDTO getEnderecoDestino() {
        return enderecoDestino;
    }

    public void setEnderecoDestino(EnderecoRequestDTO enderecoDestino) {
        this.enderecoDestino = enderecoDestino;
    }
}
