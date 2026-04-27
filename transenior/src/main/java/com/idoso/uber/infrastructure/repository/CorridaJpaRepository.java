package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Corrida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CorridaJpaRepository extends JpaRepository<Corrida, Long> {

    @Query("SELECT COUNT(c) > 0 FROM Corrida c WHERE c.idoso.id = :idosoId AND c.motorista.id = :motoristaId")
    boolean existsByIdosoIdAndMotoristaId(@Param("idosoId") Long idosoId, @Param("motoristaId") Long motoristaId);

    boolean existsByMotoristaId(Long motoristaId);

    boolean existsByIdosoId(Long idosoId);

    void deleteByMotorista_Id(Long motoristaId);

    void deleteByIdoso_Id(Long idosoId);

    @Query("SELECT COUNT(c) > 0 FROM Corrida c WHERE c.origem.id = :id OR c.destino.id = :id")
    boolean existsByEnderecoId(@Param("id") Long enderecoId);

    @Query("SELECT c FROM Corrida c " +
           "LEFT JOIN FETCH c.origem LEFT JOIN FETCH c.destino " +
           "LEFT JOIN FETCH c.motorista LEFT JOIN FETCH c.idoso WHERE c.id = :id")
    Optional<Corrida> findByIdWithEnderecosAndPessoas(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Corrida c " +
           "LEFT JOIN FETCH c.origem LEFT JOIN FETCH c.destino " +
           "LEFT JOIN FETCH c.motorista LEFT JOIN FETCH c.idoso")
    List<Corrida> findAllWithEnderecosAndPessoas();
}
