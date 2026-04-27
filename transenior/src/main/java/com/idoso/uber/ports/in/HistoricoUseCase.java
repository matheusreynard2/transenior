package com.idoso.uber.ports.in;

import com.idoso.uber.domain.model.Historico;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RegistroHistoricoRequestDTO;

import java.util.List;
import org.springframework.http.ResponseEntity;

public interface HistoricoUseCase {

    List<Historico> listar();

    ResponseEntity<Void> excluirPorId(Long id);

    ResponseEntity<Void> limpar();

    ResponseEntity<Void> excluirEmLote(IdsRequestDTO request);

    ResponseEntity<Void> registrar(RegistroHistoricoRequestDTO request);
}
