package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;

import java.util.List;

import org.springframework.http.ResponseEntity;

public interface EnderecoUseCase {

    List<Endereco> listar();

    ResponseEntity<?> deletar(Long id);

    ResponseEntity<?> deletarEmLote(IdsRequestDTO request);

    ResponseEntity<?> deletarTodos();
}
