package com.idoso.uber.application.service;

import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.infrastructure.repository.CorridaJpaRepository;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.infrastructure.repository.RelacionamentoMotoristaIdosoRepository;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DadosSistemaService {

    private final MotoristaJpaRepository motoristaRepository;
    private final IdosoJpaRepository idosoRepository;
    private final RelacionamentoMotoristaIdosoRepository relacionamentoRepository;
    private final CorridaJpaRepository corridaRepository;
    private final EnderecoJpaRepository enderecoRepository;
    private final HistoricoService historicoService;

    public DadosSistemaService(MotoristaJpaRepository motoristaRepository,
                               IdosoJpaRepository idosoRepository,
                               RelacionamentoMotoristaIdosoRepository relacionamentoRepository,
                               CorridaJpaRepository corridaRepository,
                               EnderecoJpaRepository enderecoRepository,
                               HistoricoService historicoService) {
        this.motoristaRepository = motoristaRepository;
        this.idosoRepository = idosoRepository;
        this.relacionamentoRepository = relacionamentoRepository;
        this.corridaRepository = corridaRepository;
        this.enderecoRepository = enderecoRepository;
        this.historicoService = historicoService;
    }

    @Transactional
    public ResponseEntity<Void> deletarMotoristaPorId(Long id) {
        if (id == null || !motoristaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.MOTORISTA.name(), "motoristaId=" + id + " (página Dados do sistema)");
        corridaRepository.deleteByMotorista_Id(id);
        relacionamentoRepository.findByMotorista_Id(id).stream()
                .map(RelacionamentoMotoristaIdoso::getId)
                .filter(Objects::nonNull)
                .forEach(relacionamentoRepository::deleteById);
        motoristaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarMotoristasPorIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ids.stream().filter(Objects::nonNull).filter(motoristaRepository::existsById).forEach(this::deletarMotoristaPorId);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarTodosMotoristas() {
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.MOTORISTA.name(), "todos (página Dados do sistema)");
        corridaRepository.deleteAll();
        relacionamentoRepository.deleteAll();
        motoristaRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarIdosoPorId(Long id) {
        if (id == null || !idosoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.IDOSO.name(), "idosoId=" + id + " (página Dados do sistema)");
        corridaRepository.deleteByIdoso_Id(id);
        relacionamentoRepository.findByIdoso_Id(id).stream()
                .map(RelacionamentoMotoristaIdoso::getId)
                .filter(Objects::nonNull)
                .forEach(relacionamentoRepository::deleteById);
        idosoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarIdososPorIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ids.stream().filter(Objects::nonNull).filter(idosoRepository::existsById).forEach(this::deletarIdosoPorId);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarTodosIdosos() {
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.IDOSO.name(), "todos (página Dados do sistema)");
        corridaRepository.deleteAll();
        relacionamentoRepository.deleteAll();
        idosoRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarRelacionamentoPorId(Long id) {
        if (id == null || !relacionamentoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.RELACIONAMENTO.name(), "relacionamentoId=" + id + " (página Dados do sistema)");
        relacionamentoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarRelacionamentosPorIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        for (Long id : ids) {
            if (id != null && relacionamentoRepository.existsById(id)) {
                historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.RELACIONAMENTO.name(), "relacionamentoId=" + id + " (página Dados do sistema)");
                relacionamentoRepository.deleteById(id);
            }
        }
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deletarTodosRelacionamentos() {
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.RELACIONAMENTO.name(), "todos (página Dados do sistema)");
        corridaRepository.deleteAll();
        relacionamentoRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    private static final String MSG_ENDERECO_VINCULADO =
            "Não é possível excluir. Existem corridas, motoristas ou idosos vinculados a este(s) endereço(s). Exclua primeiro as corridas, motoristas e idosos que utilizam estes endereços.";

    private boolean enderecoPossuiVinculos(Long enderecoId) {
        return corridaRepository.existsByEnderecoId(enderecoId)
                || motoristaRepository.existsByEnderecoId(enderecoId)
                || idosoRepository.existsByEnderecoId(enderecoId);
    }

    @Transactional
    public ResponseEntity<?> deletarEnderecoPorId(Long id) {
        if (id == null || !enderecoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (enderecoPossuiVinculos(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensagem", MSG_ENDERECO_VINCULADO));
        }
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.ENDERECO.name(), "enderecoId=" + id + " (página Dados do sistema)");
        enderecoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<?> deletarEnderecosPorIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        for (Long id : ids) {
            if (id != null && enderecoRepository.existsById(id) && enderecoPossuiVinculos(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensagem", MSG_ENDERECO_VINCULADO));
            }
        }
        for (Long id : ids) {
            if (id != null && enderecoRepository.existsById(id)) {
                historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.ENDERECO.name(), "enderecoId=" + id + " (página Dados do sistema)");
                enderecoRepository.deleteById(id);
            }
        }
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<?> deletarTodosEnderecos() {
        List<Long> ids = enderecoRepository.findAll().stream().map(e -> e.getId()).toList();
        for (Long id : ids) {
            if (enderecoPossuiVinculos(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensagem", MSG_ENDERECO_VINCULADO));
            }
        }
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.ENDERECO.name(), "todos (página Dados do sistema)");
        enderecoRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
