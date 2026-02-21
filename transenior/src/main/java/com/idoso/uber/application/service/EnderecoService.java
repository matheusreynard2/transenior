package com.idoso.uber.application.service;

import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.ports.in.EnderecoUseCase;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class EnderecoService implements EnderecoUseCase {

    private final EnderecoJpaRepository repository;
    private final DadosSistemaService dadosSistemaService;

    public EnderecoService(EnderecoJpaRepository repository, DadosSistemaService dadosSistemaService) {
        this.repository = repository;
        this.dadosSistemaService = dadosSistemaService;
    }

    @Override
    public List<Endereco> listar() {
        return repository.findAll();
    }

    @Override
    public ResponseEntity<?> deletar(Long id) {
        return dadosSistemaService.deletarEnderecoPorId(id);
    }

    @Override
    public ResponseEntity<?> deletarEmLote(IdsRequestDTO request) {
        return dadosSistemaService.deletarEnderecosPorIds(request != null ? request.getIds() : null);
    }

    @Override
    public ResponseEntity<?> deletarTodos() {
        return dadosSistemaService.deletarTodosEnderecos();
    }
}
