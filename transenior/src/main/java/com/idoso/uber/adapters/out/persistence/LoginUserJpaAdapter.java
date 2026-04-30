package com.idoso.uber.adapters.out.persistence;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.idoso.uber.domain.model.LoginUser;
import com.idoso.uber.infrastructure.repository.LoginUserJpaRepository;
import com.idoso.uber.ports.out.LoginUserRepositoryPort;

@Component
public class LoginUserJpaAdapter implements LoginUserRepositoryPort {

    private final LoginUserJpaRepository repository;

    public LoginUserJpaAdapter(LoginUserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<LoginUser> findByEmailAndSenha(String email, String senha) {
        return repository.findByEmailAndSenha(email, senha);
    }
}