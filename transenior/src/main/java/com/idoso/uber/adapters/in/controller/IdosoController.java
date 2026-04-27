package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.Idoso;
import com.idoso.uber.domain.requests_dtos.IdosoRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.ports.in.IdosoUseCase;

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
@RequestMapping("/v1/idosos")
public class IdosoController {

    private final IdosoUseCase idosoUseCase;

    public IdosoController(IdosoUseCase idosoUseCase) {
        this.idosoUseCase = idosoUseCase;
    }

    @PostMapping
    public Idoso criar(@RequestBody IdosoRequestDTO request) {
        return idosoUseCase.criar(request);
    }

    @GetMapping
    public List<Idoso> listar() {
        return idosoUseCase.listar();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return idosoUseCase.deletar(id);
    }

    @DeleteMapping("/em-lote")
    public ResponseEntity<Void> deletarEmLote(@RequestBody IdsRequestDTO request) {
        return idosoUseCase.deletarEmLote(request);
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarTodos() {
        return idosoUseCase.deletarTodos();
    }
}
