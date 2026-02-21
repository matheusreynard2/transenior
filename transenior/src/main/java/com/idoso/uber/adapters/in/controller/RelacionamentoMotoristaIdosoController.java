package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RelacionamentoRequestDTO;
import com.idoso.uber.ports.in.RelacionamentoMotoristaIdosoUseCase;

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
@RequestMapping("/v1/relacionamentos")
public class RelacionamentoMotoristaIdosoController {

    private final RelacionamentoMotoristaIdosoUseCase relacionamentoUseCase;

    public RelacionamentoMotoristaIdosoController(RelacionamentoMotoristaIdosoUseCase relacionamentoUseCase) {
        this.relacionamentoUseCase = relacionamentoUseCase;
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody RelacionamentoRequestDTO request) {
        return relacionamentoUseCase.criar(request);
    }

    @GetMapping
    public List<RelacionamentoMotoristaIdoso> listar() {
        return relacionamentoUseCase.listar();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return relacionamentoUseCase.deletar(id);
    }

    @DeleteMapping("/em-lote")
    public ResponseEntity<Void> deletarEmLote(@RequestBody IdsRequestDTO request) {
        return relacionamentoUseCase.deletarEmLote(request);
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarTodos() {
        return relacionamentoUseCase.deletarTodos();
    }
}
