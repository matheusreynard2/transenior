package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;

public interface RelacionamentoMotoristaIdosoRepository extends JpaRepository<RelacionamentoMotoristaIdoso, Long> {

    /**
     * Busca um relacionamento por id com motorista, idoso e endereços carregados.
     */
    @Query("SELECT r FROM RelacionamentoMotoristaIdoso r " +
           "LEFT JOIN FETCH r.motorista LEFT JOIN FETCH r.idoso " +
           "LEFT JOIN FETCH r.idoso.enderecoOrigem LEFT JOIN FETCH r.idoso.enderecoDestino " +
           "LEFT JOIN FETCH r.motorista.enderecoOrigem LEFT JOIN FETCH r.motorista.enderecoDestino " +
           "WHERE r.id = :id")
    Optional<RelacionamentoMotoristaIdoso> findByIdComMotoristaEIdoso(@Param("id") Long id);

    /**
     * Busca todos os registros de relacionamento_motorista_idoso
     * com motorista, idoso e endereços de ambos (tabela enderecos via id_origem/id_destino).
     */
    @Query("SELECT DISTINCT r FROM RelacionamentoMotoristaIdoso r " +
           "JOIN FETCH r.motorista JOIN FETCH r.idoso " +
           "LEFT JOIN FETCH r.idoso.enderecoOrigem LEFT JOIN FETCH r.idoso.enderecoDestino " +
           "LEFT JOIN FETCH r.motorista.enderecoOrigem LEFT JOIN FETCH r.motorista.enderecoDestino")
    List<RelacionamentoMotoristaIdoso> findAllComMotoristaEIdoso();

    List<RelacionamentoMotoristaIdoso> findByMotoristaIdAndIdosoId(Long motoristaId, Long idosoId);

    boolean existsByMotorista_IdAndIdoso_Id(Long motoristaId, Long idosoId);

    List<RelacionamentoMotoristaIdoso> findByMotorista_Id(Long motoristaId);

    List<RelacionamentoMotoristaIdoso> findByIdoso_Id(Long idosoId);
}
