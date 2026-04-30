package com.idoso.uber.infrastructure.repository;

import java.util.Optional;

import com.idoso.uber.domain.model.LoginUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginUserJpaRepository extends JpaRepository<LoginUser, Long> {

    Optional<LoginUser> findByEmailAndSenha(String email, String senha);
}
