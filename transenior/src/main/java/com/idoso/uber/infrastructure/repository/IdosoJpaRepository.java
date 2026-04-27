package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IdosoJpaRepository extends JpaRepository<Idoso, Long> {

    @Query("SELECT COUNT(i) > 0 FROM Idoso i WHERE i.enderecoOrigem.id = :id OR i.enderecoDestino.id = :id")
    boolean existsByEnderecoId(@Param("id") Long enderecoId);
}
