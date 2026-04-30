package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.LoginUser;
import com.idoso.uber.domain.requests_dtos.LoginUserRequestDTO;
import com.idoso.uber.ports.in.LoginUserUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/login")
public class LoginUserController {

    private final LoginUserUseCase loginUserUseCase;

    public LoginUserController(LoginUserUseCase loginUserUseCase) {
        this.loginUserUseCase = loginUserUseCase;
    }

    @PostMapping("/realizarLogin")
    public ResponseEntity<LoginUser> realizarLogin(@RequestBody LoginUserRequestDTO requestLoginDTO) {
        return loginUserUseCase.realizarLogin(requestLoginDTO);
    }
}
