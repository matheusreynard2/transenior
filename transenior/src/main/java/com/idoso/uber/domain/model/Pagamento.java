package com.idoso.uber.domain.model;

import java.math.BigDecimal;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;

@Entity
@Table(name = "pagamentos")
@SequenceGenerator(name = "pagamento_seq", sequenceName = "pagamento_seq", allocationSize = 1)
public class Pagamento {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pagamento_seq")
    private Long id;
    private BigDecimal valor;
    private String formaPagamento;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}
