package com.idoso.uber.application.service;

import com.idoso.uber.application.util.VerificarNull;
import com.idoso.uber.domain.model.Corrida;
import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.LoginUser;
import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.domain.requests_dtos.CorridaRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.LoginUserRequestDTO;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.infrastructure.repository.RelacionamentoMotoristaIdosoRepository;
import com.idoso.uber.ports.in.CorridaUseCase;
import com.idoso.uber.ports.in.LoginUserUseCase;
import com.idoso.uber.ports.out.CorridaRepositoryPort;
import com.idoso.uber.ports.out.LoginUserRepositoryPort;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginUserService implements LoginUserUseCase {

    private final LoginUserRepositoryPort repository;
    
    //FAZER COM PORT NO CORRIDA SERVICE
    //private final RelacionamentoMotoristaIdosoRepository relacionamentoRepository;
    //private final MotoristaJpaRepository motoristaRepository;
    //private final IdosoJpaRepository idosoRepository;
    //private final EnderecoJpaRepository enderecoRepository;
    //private final HistoricoService historicoService;

    public LoginUserService(LoginUserRepositoryPort repository) {
        this.repository = repository;
    }

    @Transactional
    public ResponseEntity<LoginUser> realizarLogin(LoginUserRequestDTO requestLoginDTO) {
        VerificarNull.verificarNull(requestLoginDTO);

        Optional<LoginUser> existente = this.repository.findByEmailAndSenha(requestLoginDTO.getEmail(), requestLoginDTO.getSenha());
        VerificarNull.verificarNull(existente);

        if (existente != null) {
            return ResponseEntity.ok(existente.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

    }
}
