package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.LoginUser;
import com.idoso.uber.domain.requests_dtos.LoginUserRequestDTO;

import org.springframework.http.ResponseEntity;

public interface LoginUserUseCase {

    ResponseEntity<LoginUser> realizarLogin(LoginUserRequestDTO requestLoginDTO);
}
