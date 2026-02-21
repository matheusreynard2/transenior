package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.Motorista;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.MotoristaRequestDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;

public interface MotoristaUseCase {

    Motorista criar(MotoristaRequestDTO request);

    List<Motorista> listar();

    ResponseEntity<Void> deletar(Long id);

    ResponseEntity<Void> deletarEmLote(IdsRequestDTO request);

    ResponseEntity<Void> deletarTodos();
}
