package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.Motorista;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.MotoristaRequestDTO;
import com.idoso.uber.ports.in.MotoristaUseCase;

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
@RequestMapping("/v1/motoristas")
public class MotoristaController {

    private final MotoristaUseCase motoristaUseCase;

    public MotoristaController(MotoristaUseCase motoristaUseCase) {
        this.motoristaUseCase = motoristaUseCase;
    }

    @PostMapping
    public Motorista criar(@RequestBody MotoristaRequestDTO request) {
        return motoristaUseCase.criar(request);
    }

    @GetMapping
    public List<Motorista> listar() {
        return motoristaUseCase.listar();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return motoristaUseCase.deletar(id);
    }

    @DeleteMapping("/em-lote")
    public ResponseEntity<Void> deletarEmLote(@RequestBody IdsRequestDTO request) {
        return motoristaUseCase.deletarEmLote(request);
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarTodos() {
        return motoristaUseCase.deletarTodos();
    }
}
