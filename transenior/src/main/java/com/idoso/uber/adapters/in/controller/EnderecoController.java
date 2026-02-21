package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.ports.in.EnderecoUseCase;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/enderecos")
public class EnderecoController {

    private final EnderecoUseCase enderecoUseCase;

    public EnderecoController(EnderecoUseCase enderecoUseCase) {
        this.enderecoUseCase = enderecoUseCase;
    }

    @GetMapping
    public List<Endereco> listar() {
        return enderecoUseCase.listar();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return enderecoUseCase.deletar(id);
    }

    @DeleteMapping("/em-lote")
    public ResponseEntity<?> deletarEmLote(@RequestBody IdsRequestDTO request) {
        return enderecoUseCase.deletarEmLote(request);
    }

    @DeleteMapping
    public ResponseEntity<?> deletarTodos() {
        return enderecoUseCase.deletarTodos();
    }
}
