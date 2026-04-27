package com.idoso.uber.application.service;

import com.idoso.uber.application.util.VerificarNull;
import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.Historico;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RegistroHistoricoRequestDTO;
import com.idoso.uber.infrastructure.repository.HistoricoJpaRepository;
import com.idoso.uber.ports.in.HistoricoUseCase;
import java.util.List;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class HistoricoService implements HistoricoUseCase {

    private final HistoricoJpaRepository repository;

    public HistoricoService(HistoricoJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Historico> listar() {
        return repository.findAllByOrderByDataHoraDesc();
    }

    @Override
    public ResponseEntity<Void> excluirPorId(Long id) {
        if (id == null || !repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> limpar() {
        repository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> excluirEmLote(IdsRequestDTO request) {
        List<Long> ids = request != null ? request.getIds() : null;
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ids.stream()
                .filter(Objects::nonNull)
                .filter(repository::existsById)
                .forEach(repository::deleteById);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> registrar(RegistroHistoricoRequestDTO request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        return registrar(request.getTipoAcao(), request.getEntidadeAfetada(), request.getDescricao());
    }

    /** Chamado por outros services (ex.: CorridaService). */
    public ResponseEntity<Void> registrar(String tipoAcao, String entidadeAfetada, String descricao) {
        VerificarNull.verificarNull(tipoAcao);
        VerificarNull.verificarNull(entidadeAfetada);
        String desc = (descricao != null && !descricao.isBlank()) ? descricao : "";
        repository.save(new Historico(tipoAcao, entidadeAfetada, desc));
        return ResponseEntity.noContent().build();
    }
}
