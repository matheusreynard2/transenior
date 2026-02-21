package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Historico;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricoJpaRepository extends JpaRepository<Historico, Long> {

    List<Historico> findAllByOrderByDataHoraDesc();

    Optional<Historico> findTopByOrderByDataHoraDesc();
}
