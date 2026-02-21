package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MotoristaJpaRepository extends JpaRepository<Motorista, Long> {

    @Query("SELECT COUNT(m) > 0 FROM Motorista m WHERE m.enderecoOrigem.id = :id OR m.enderecoDestino.id = :id")
    boolean existsByEnderecoId(@Param("id") Long enderecoId);
}
