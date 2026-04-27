package com.idoso.uber.domain.requests_dtos;

import java.time.LocalDate;

public class MotoristaRequestDTO {
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    private boolean ativo;
    private String cnh;
    private String coren;
    private String servicos;
    private boolean disponivel;
    private boolean aprovado;
    private Long enderecoOrigemId;
    private Long enderecoDestinoId;
    /** Opcional: criar endereço de origem a partir do body (frontend envia como DTO). */
    private EnderecoRequestDTO enderecoOrigem;
    /** Opcional: criar endereço de destino a partir do body (frontend envia como DTO). */
    private EnderecoRequestDTO enderecoDestino;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public String getCnh() { return cnh; }
    public void setCnh(String cnh) { this.cnh = cnh; }
    public String getCoren() { return coren; }
    public void setCoren(String coren) { this.coren = coren; }
    public String getServicos() { return servicos; }
    public void setServicos(String servicos) { this.servicos = servicos; }
    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
    public boolean isAprovado() { return aprovado; }
    public void setAprovado(boolean aprovado) { this.aprovado = aprovado; }
    public Long getEnderecoOrigemId() { return enderecoOrigemId; }
    public void setEnderecoOrigemId(Long enderecoOrigemId) { this.enderecoOrigemId = enderecoOrigemId; }
    public Long getEnderecoDestinoId() { return enderecoDestinoId; }
    public void setEnderecoDestinoId(Long enderecoDestinoId) { this.enderecoDestinoId = enderecoDestinoId; }
    public EnderecoRequestDTO getEnderecoOrigem() { return enderecoOrigem; }
    public void setEnderecoOrigem(EnderecoRequestDTO enderecoOrigem) { this.enderecoOrigem = enderecoOrigem; }
    public EnderecoRequestDTO getEnderecoDestino() { return enderecoDestino; }
    public void setEnderecoDestino(EnderecoRequestDTO enderecoDestino) { this.enderecoDestino = enderecoDestino; }
}
