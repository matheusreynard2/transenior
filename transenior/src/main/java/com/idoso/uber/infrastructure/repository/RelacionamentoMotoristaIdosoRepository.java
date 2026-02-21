package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;

public interface RelacionamentoMotoristaIdosoRepository extends JpaRepository<RelacionamentoMotoristaIdoso, Long> {

    /**
     * Busca um relacionamento por id com motorista, idoso e endereços carregados.
     * Usa @EntityGraph para evitar múltiplos JOIN FETCH na mesma query.
     */
    @EntityGraph(attributePaths = {
            "motorista", "motorista.enderecoOrigem", "motorista.enderecoDestino",
            "idoso", "idoso.enderecoOrigem", "idoso.enderecoDestino"
    })
    @Query("SELECT r FROM RelacionamentoMotoristaIdoso r WHERE r.id = :id")
    Optional<RelacionamentoMotoristaIdoso> findByIdComMotoristaEIdoso(@Param("id") Long id);

    /**
     * Busca todos os registros de relacionamento_motorista_idoso
     * com motorista, idoso e endereços de ambos (tabela enderecos via id_origem/id_destino).
     * Usa @EntityGraph para evitar múltiplos JOIN FETCH na mesma query.
     */
    @EntityGraph(attributePaths = {
            "motorista", "motorista.enderecoOrigem", "motorista.enderecoDestino",
            "idoso", "idoso.enderecoOrigem", "idoso.enderecoDestino"
    })
    @Query("SELECT r FROM RelacionamentoMotoristaIdoso r")
    List<RelacionamentoMotoristaIdoso> findAllComMotoristaEIdoso();

    List<RelacionamentoMotoristaIdoso> findByMotoristaIdAndIdosoId(Long motoristaId, Long idosoId);

    boolean existsByMotorista_IdAndIdoso_Id(Long motoristaId, Long idosoId);

    List<RelacionamentoMotoristaIdoso> findByMotorista_Id(Long motoristaId);

    List<RelacionamentoMotoristaIdoso> findByIdoso_Id(Long idosoId);
}
