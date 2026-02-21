package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.Historico;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RegistroHistoricoRequestDTO;
import com.idoso.uber.ports.in.HistoricoUseCase;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/historicos")
public class HistoricoController {

    private final HistoricoUseCase historicoUseCase;

    public HistoricoController(HistoricoUseCase historicoUseCase) {
        this.historicoUseCase = historicoUseCase;
    }

    @GetMapping
    public List<Historico> listar() {
        return historicoUseCase.listar();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirPorId(@PathVariable Long id) {
        return historicoUseCase.excluirPorId(id);
    }

    @DeleteMapping
    public ResponseEntity<Void> limpar() {
        return historicoUseCase.limpar();
    }

    @DeleteMapping("/em-lote")
    public ResponseEntity<Void> excluirEmLote(@RequestBody IdsRequestDTO request) {
        return historicoUseCase.excluirEmLote(request);
    }

    @PostMapping
    public ResponseEntity<Void> registrar(@RequestBody RegistroHistoricoRequestDTO request) {
        return historicoUseCase.registrar(request);
    }

}