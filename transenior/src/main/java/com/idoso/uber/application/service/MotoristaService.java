package com.idoso.uber.application.service;

import com.idoso.uber.application.util.VerificarNull;
import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.model.Motorista;
import com.idoso.uber.domain.requests_dtos.EnderecoRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.MotoristaRequestDTO;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.ports.in.MotoristaUseCase;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class MotoristaService implements MotoristaUseCase {

    private final MotoristaJpaRepository repository;
    private final EnderecoJpaRepository enderecoRepository;
    private final HistoricoService historicoService;
    private final DadosSistemaService dadosSistemaService;

    public MotoristaService(MotoristaJpaRepository repository,
                            EnderecoJpaRepository enderecoRepository,
                            HistoricoService historicoService,
                            DadosSistemaService dadosSistemaService) {
        this.repository = repository;
        this.enderecoRepository = enderecoRepository;
        this.historicoService = historicoService;
        this.dadosSistemaService = dadosSistemaService;
    }

    @Override
    public Motorista criar(MotoristaRequestDTO request) {
        VerificarNull.verificarNull(request);
        Motorista motorista = new Motorista();
        motorista.setNome(request.getNome());
        motorista.setCpf(request.getCpf());
        motorista.setDataNascimento(request.getDataNascimento());
        motorista.setTelefone(request.getTelefone());
        motorista.setEmail(request.getEmail());
        motorista.setAtivo(request.isAtivo());
        motorista.setCnh(request.getCnh());
        motorista.setCoren(request.getCoren());
        motorista.setServicos(request.getServicos());
        motorista.setDisponivel(request.isDisponivel());
        motorista.setAprovado(request.isAprovado());
        if (request.getEnderecoOrigem() != null && temDadosEndereco(request.getEnderecoOrigem())) {
            motorista.setEnderecoOrigem(criarOuBuscarEndereco(request.getEnderecoOrigem(), request.getEnderecoOrigemId()));
        } else if (request.getEnderecoOrigemId() != null) {
            enderecoRepository.findById(request.getEnderecoOrigemId()).ifPresent(motorista::setEnderecoOrigem);
        }
        if (request.getEnderecoDestino() != null && temDadosEndereco(request.getEnderecoDestino())) {
            motorista.setEnderecoDestino(criarOuBuscarEndereco(request.getEnderecoDestino(), request.getEnderecoDestinoId()));
        } else if (request.getEnderecoDestinoId() != null) {
            enderecoRepository.findById(request.getEnderecoDestinoId()).ifPresent(motorista::setEnderecoDestino);
        }
        Motorista salvo = repository.save(motorista);

        String origemId = salvo.getEnderecoOrigem() != null ? String.valueOf(salvo.getEnderecoOrigem().getId()) : "-";
        String destinoId = salvo.getEnderecoDestino() != null ? String.valueOf(salvo.getEnderecoDestino().getId()) : "-";
        String desc = "motoristaId=" + salvo.getId() + " | enderecoOrigemId=" + origemId + " | enderecoDestinoId=" + destinoId;

        historicoService.registrar("CADASTRO", "MOTORISTA", desc);
        return salvo;
    }

    @Override
    public List<Motorista> listar() {
        return repository.findAll();
    }

    @Override
    public ResponseEntity<Void> deletar(Long id) {
        return dadosSistemaService.deletarMotoristaPorId(id);
    }

    @Override
    public ResponseEntity<Void> deletarEmLote(IdsRequestDTO request) {
        return dadosSistemaService.deletarMotoristasPorIds(request != null ? request.getIds() : null);
    }

    @Override
    public ResponseEntity<Void> deletarTodos() {
        return dadosSistemaService.deletarTodosMotoristas();
    }

    private static boolean temDadosEndereco(EnderecoRequestDTO dto) {
        return (dto.getLogradouro() != null && !dto.getLogradouro().isBlank())
                || (dto.getNumero() != null && !dto.getNumero().isBlank())
                || (dto.getCidade() != null && !dto.getCidade().isBlank())
                || (dto.getEstado() != null && !dto.getEstado().isBlank());
    }

    private Endereco criarOuBuscarEndereco(EnderecoRequestDTO dto, Long idExistente) {
        if (idExistente != null) {
            return enderecoRepository.findById(idExistente).orElseGet(() -> criarEndereco(dto));
        }
        return criarEndereco(dto);
    }

    private Endereco criarEndereco(EnderecoRequestDTO dto) {
        Endereco e = new Endereco();
        e.setLogradouro(dto.getLogradouro() != null ? dto.getLogradouro() : "");
        e.setNumero(dto.getNumero() != null ? dto.getNumero() : "");
        e.setCidade(dto.getCidade() != null ? dto.getCidade() : "");
        e.setEstado(dto.getEstado() != null ? dto.getEstado() : "");
        return enderecoRepository.save(e);
    }
}
