package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IdosoJpaRepository extends JpaRepository<Idoso, Long> {

    @Query("SELECT COUNT(i) > 0 FROM Idoso i WHERE i.enderecoOrigem.id = :id OR i.enderecoDestino.id = :id")
    boolean existsByEnderecoId(@Param("id") Long enderecoId);

    /** Idosos que não possuem nenhuma corrida com status FINALIZADA (disponíveis para novo relacionamento na página de relacionamento). */
    @Query("SELECT i FROM Idoso i WHERE i.id NOT IN (SELECT c.idoso.id FROM Corrida c WHERE c.statusCorrida = :status)")
    List<Idoso> findByIdososSemCorridaComStatus(@Param("status") Enuns.StatusCorrida status);
}
