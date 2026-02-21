package com.idoso.uber.domain.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "relacionamento_motorista_idoso")
@SequenceGenerator(name = "relacionamento_motorista_idoso_seq", sequenceName = "relacionamento_motorista_idoso_seq", allocationSize = 1)
public class RelacionamentoMotoristaIdoso {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "relacionamento_motorista_idoso_seq")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "motorista_id")
    private Motorista motorista;

    @ManyToOne
    @JoinColumn(name = "idoso_id")
    private Idoso idoso;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Motorista getMotorista() {
        return motorista;
    }

    public void setMotorista(Motorista motorista) {
        this.motorista = motorista;
    }

    public Idoso getIdoso() {
        return idoso;
    }

    public void setIdoso(Idoso idoso) {
        this.idoso = idoso;
    }
}
