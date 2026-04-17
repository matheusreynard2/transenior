package com.idoso.uber.ports.in;

import java.util.List;

import com.idoso.uber.domain.model.Corrida;
import com.idoso.uber.domain.requests_dtos.CorridaRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;

import org.springframework.http.ResponseEntity;

public interface CorridaUseCase {

    Corrida addCorrida(CorridaRequestDTO request);

    List<Corrida> getTodasCorridas();

    /** Corridas com status FINALIZADA (para a página "Corridas finalizadas"). */
    List<Corrida> getCorridasFinalizadas();

    Corrida getCorrida(Long id);

    void deletarCorrida(Long id);

    ResponseEntity<Void> deletarCorridas(IdsRequestDTO request);

    ResponseEntity<Corrida> editarCorrida(Long id, CorridaRequestDTO request);
}
