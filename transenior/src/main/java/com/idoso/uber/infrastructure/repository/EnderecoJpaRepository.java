package com.idoso.uber.infrastructure.repository;

import com.idoso.uber.domain.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnderecoJpaRepository extends JpaRepository<Endereco, Long> {
}
