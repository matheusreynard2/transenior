package com.idoso.uber.ports.out;

import java.util.Optional;

import com.idoso.uber.domain.model.LoginUser;

public interface LoginUserRepositoryPort {

    Optional<LoginUser> findByEmailAndSenha(String email, String senha);

}
