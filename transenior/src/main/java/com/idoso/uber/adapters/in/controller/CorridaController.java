package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.Corrida;
import com.idoso.uber.domain.requests_dtos.CorridaRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.ports.in.CorridaUseCase;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/corridas")
public class CorridaController {

    private final CorridaUseCase corridaUseCase;

    public CorridaController(CorridaUseCase corridaUseCase) {
        this.corridaUseCase = corridaUseCase;
    }

    @PostMapping("/solicitarCorrida")
    public Corrida addCorrida(@RequestBody CorridaRequestDTO request) {
        return corridaUseCase.addCorrida(request);
    }

    @GetMapping("/todasCorridas")
    public List<Corrida> getTodasCorridas() {
        return corridaUseCase.getTodasCorridas();
    }

    @GetMapping("/consultarCorrida/{id}")
    public Corrida getCorrida(@PathVariable Long id) {
        return corridaUseCase.getCorrida(id);
    }

    @DeleteMapping("/deletarCorrida/{id}")
    public void deletarCorrida(@PathVariable Long id) {
        corridaUseCase.deletarCorrida(id);
    }

    @DeleteMapping("/deletarCorridas")
    public ResponseEntity<Void> deletarCorridas(@RequestBody IdsRequestDTO request) {
        return corridaUseCase.deletarCorridas(request);
    }

    @PutMapping("/editarCorrida/{id}")
    public ResponseEntity<Corrida> editarCorrida(@PathVariable Long id, @RequestBody CorridaRequestDTO request) {
        return corridaUseCase.editarCorrida(id, request);
    }
}
