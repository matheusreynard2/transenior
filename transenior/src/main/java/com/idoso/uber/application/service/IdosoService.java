package com.idoso.uber.application.service;

import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.Idoso;
import com.idoso.uber.domain.requests_dtos.EnderecoRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdosoRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.ports.in.IdosoUseCase;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class IdosoService implements IdosoUseCase {

    private final IdosoJpaRepository repository;
    private final EnderecoJpaRepository enderecoRepository;
    private final HistoricoService historicoService;
    private final DadosSistemaService dadosSistemaService;

    public IdosoService(IdosoJpaRepository repository,
                        EnderecoJpaRepository enderecoRepository,
                        HistoricoService historicoService,
                        DadosSistemaService dadosSistemaService) {
        this.repository = repository;
        this.enderecoRepository = enderecoRepository;
        this.historicoService = historicoService;
        this.dadosSistemaService = dadosSistemaService;
    }

    @Override
    public Idoso criar(IdosoRequestDTO request) {
        Idoso idoso = new Idoso();
        idoso.setNome(request.getNome());
        idoso.setCpf(request.getCpf());
        idoso.setDataNascimento(request.getDataNascimento());
        idoso.setTelefone(request.getTelefone());
        idoso.setEmail(request.getEmail());
        idoso.setAtivo(request.isAtivo());
        idoso.setContatoEmergencia(request.getContatoEmergencia());
        if (request.getEnderecoOrigem() != null && temDadosEndereco(request.getEnderecoOrigem())) {
            idoso.setEnderecoOrigem(criarOuBuscarEndereco(request.getEnderecoOrigem(), request.getEnderecoOrigemId()));
        } else if (request.getEnderecoOrigemId() != null) {
            enderecoRepository.findById(request.getEnderecoOrigemId()).ifPresent(idoso::setEnderecoOrigem);
        }
        if (request.getEnderecoDestino() != null && temDadosEndereco(request.getEnderecoDestino())) {
            idoso.setEnderecoDestino(criarOuBuscarEndereco(request.getEnderecoDestino(), request.getEnderecoDestinoId()));
        } else if (request.getEnderecoDestinoId() != null) {
            enderecoRepository.findById(request.getEnderecoDestinoId()).ifPresent(idoso::setEnderecoDestino);
        }
        Idoso salvo = repository.save(idoso);
        String origemId = salvo.getEnderecoOrigem() != null ? String.valueOf(salvo.getEnderecoOrigem().getId()) : "-";
        String destinoId = salvo.getEnderecoDestino() != null ? String.valueOf(salvo.getEnderecoDestino().getId()) : "-";
        String desc = "idosoId=" + salvo.getId() + " | enderecoOrigemId=" + origemId + " | enderecoDestinoId=" + destinoId;
        historicoService.registrar(Enuns.TipoAcao.CADASTRO.name(), Enuns.EntidadeAfetada.IDOSO.name(), desc);
        return salvo;
    }

    @Override
    public List<Idoso> listar() {
        return repository.findAll();
    }

    @Override
    public ResponseEntity<Void> deletar(Long id) {
        return dadosSistemaService.deletarIdosoPorId(id);
    }

    @Override
    public ResponseEntity<Void> deletarEmLote(IdsRequestDTO request) {
        return dadosSistemaService.deletarIdososPorIds(request != null ? request.getIds() : null);
    }

    @Override
    public ResponseEntity<Void> deletarTodos() {
        return dadosSistemaService.deletarTodosIdosos();
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
