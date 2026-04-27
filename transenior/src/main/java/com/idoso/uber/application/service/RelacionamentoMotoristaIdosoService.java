package com.idoso.uber.application.service;

import com.idoso.uber.application.exception.RelacionamentoJaExistenteException;
import com.idoso.uber.application.util.VerificarNull;
import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.Idoso;
import com.idoso.uber.domain.model.Motorista;
import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.domain.requests_dtos.RelacionamentoRequestDTO;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.infrastructure.repository.RelacionamentoMotoristaIdosoRepository;
import com.idoso.uber.ports.in.RelacionamentoMotoristaIdosoUseCase;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class RelacionamentoMotoristaIdosoService implements RelacionamentoMotoristaIdosoUseCase {

    private final RelacionamentoMotoristaIdosoRepository relacionamentoRepository;
    private final MotoristaJpaRepository motoristaRepository;
    private final IdosoJpaRepository idosoRepository;
    private final HistoricoService historicoService;
    private final CorridaService corridaService;
    private final DadosSistemaService dadosSistemaService;

    public RelacionamentoMotoristaIdosoService(
            RelacionamentoMotoristaIdosoRepository relacionamentoRepository,
            MotoristaJpaRepository motoristaRepository,
            IdosoJpaRepository idosoRepository,
            HistoricoService historicoService,
            CorridaService corridaService,
            DadosSistemaService dadosSistemaService) {
        this.relacionamentoRepository = relacionamentoRepository;
        this.motoristaRepository = motoristaRepository;
        this.idosoRepository = idosoRepository;
        this.historicoService = historicoService;
        this.corridaService = corridaService;
        this.dadosSistemaService = dadosSistemaService;
    }

    @Override
    public ResponseEntity<?> criar(RelacionamentoRequestDTO request) {
        if (VerificarNull.verificarNull(request) == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return criarInterno(request)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RelacionamentoJaExistenteException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensagem", ex.getMessage()));
        }
    }

    private Optional<RelacionamentoMotoristaIdoso> criarInterno(RelacionamentoRequestDTO request) {
        VerificarNull.verificarNull(request);
        Long motoristaId = VerificarNull.verificarNull(request.getMotoristaId());
        Long idosoId = VerificarNull.verificarNull(request.getIdosoId());

        if (relacionamentoRepository.existsByMotorista_IdAndIdoso_Id(motoristaId, idosoId)) {
            throw new RelacionamentoJaExistenteException();
        }

        Optional<Motorista> motorista = motoristaRepository.findById(motoristaId);
        Optional<Idoso> idoso = idosoRepository.findById(idosoId);
        if (motorista.isEmpty() || idoso.isEmpty()) {
            return Optional.empty();
        }
        RelacionamentoMotoristaIdoso relacionamento = new RelacionamentoMotoristaIdoso();
        relacionamento.setMotorista(motorista.get());
        relacionamento.setIdoso(idoso.get());

        RelacionamentoMotoristaIdoso salvo = relacionamentoRepository.save(relacionamento);
        registrarHistoricoCriacao(salvo);
        corridaService.criarCorridaParaRelacionamento(salvo.getId());

        return Optional.of(salvo);
    }

    private void registrarHistoricoCriacao(RelacionamentoMotoristaIdoso rel) {
        Long idMotorista = VerificarNull.verificarNull(rel.getMotorista().getId());
        Long idIdoso = VerificarNull.verificarNull(rel.getIdoso().getId());
        Long idRelacionamento = VerificarNull.verificarNull(rel.getId());

        String descricaoRel = "relacionamentoId=" + idRelacionamento + " | motoristaId=" + idMotorista + " | idosoId=" + idIdoso;
        historicoService.registrar(Enuns.TipoAcao.CADASTRO.name(), Enuns.EntidadeAfetada.RELACIONAMENTO.name(), descricaoRel);
    }

    @Override
    public List<RelacionamentoMotoristaIdoso> listar() {
        return relacionamentoRepository.findAll();
    }

    @Override
    public ResponseEntity<Void> deletar(Long id) {
        return dadosSistemaService.deletarRelacionamentoPorId(id);
    }

    @Override
    public ResponseEntity<Void> deletarEmLote(IdsRequestDTO request) {
        return dadosSistemaService.deletarRelacionamentosPorIds(request != null ? request.getIds() : null);
    }

    @Override
    public ResponseEntity<Void> deletarTodos() {
        return dadosSistemaService.deletarTodosRelacionamentos();
    }
}
