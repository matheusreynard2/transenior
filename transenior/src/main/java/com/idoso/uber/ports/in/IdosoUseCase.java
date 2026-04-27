package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.Idoso;
import com.idoso.uber.domain.requests_dtos.IdosoRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;

public interface IdosoUseCase {

    Idoso criar(IdosoRequestDTO request);

    List<Idoso> listar();

    ResponseEntity<Void> deletar(Long id);

    ResponseEntity<Void> deletarEmLote(IdsRequestDTO request);

    ResponseEntity<Void> deletarTodos();
}
