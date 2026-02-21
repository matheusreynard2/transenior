package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RelacionamentoRequestDTO;

import java.util.List;

import org.springframework.http.ResponseEntity;

public interface RelacionamentoMotoristaIdosoUseCase {

    /**
     * Cria um relacionamento motorista-idoso. Retorna 200 com o relacionamento, 400 se request inválido,
     * 404 se motorista/idoso não encontrados, 409 se já existir o par.
     */
    ResponseEntity<?> criar(RelacionamentoRequestDTO request);

    List<RelacionamentoMotoristaIdoso> listar();

    ResponseEntity<Void> deletar(Long id);

    ResponseEntity<Void> deletarEmLote(IdsRequestDTO request);

    ResponseEntity<Void> deletarTodos();

    
}
