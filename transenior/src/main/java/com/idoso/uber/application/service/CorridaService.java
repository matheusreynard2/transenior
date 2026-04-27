package com.idoso.uber.application.service;

import com.idoso.uber.application.util.VerificarNull;
import com.idoso.uber.domain.model.Corrida;
import com.idoso.uber.domain.model.Enuns;
import com.idoso.uber.domain.model.Endereco;
import com.idoso.uber.domain.model.RelacionamentoMotoristaIdoso;
import com.idoso.uber.domain.requests_dtos.CorridaRequestDTO;
import com.idoso.uber.domain.requests_dtos.IdsRequestDTO;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.infrastructure.repository.RelacionamentoMotoristaIdosoRepository;
import com.idoso.uber.ports.in.CorridaUseCase;
import com.idoso.uber.ports.out.CorridaRepositoryPort;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CorridaService implements CorridaUseCase {

    private final CorridaRepositoryPort repository;
    private final RelacionamentoMotoristaIdosoRepository relacionamentoRepository;
    private final MotoristaJpaRepository motoristaRepository;
    private final IdosoJpaRepository idosoRepository;
    private final EnderecoJpaRepository enderecoRepository;
    private final HistoricoService historicoService;

    public CorridaService(CorridaRepositoryPort repository,
                          RelacionamentoMotoristaIdosoRepository relacionamentoRepository,
                          MotoristaJpaRepository motoristaRepository,
                          IdosoJpaRepository idosoRepository,
                          EnderecoJpaRepository enderecoRepository,
                          HistoricoService historicoService) {
        this.repository = repository;
        this.relacionamentoRepository = relacionamentoRepository;
        this.motoristaRepository = motoristaRepository;
        this.idosoRepository = idosoRepository;
        this.enderecoRepository = enderecoRepository;
        this.historicoService = historicoService;
    }

    @Override
    public Corrida addCorrida(CorridaRequestDTO dto) {
        VerificarNull.verificarNull(dto);
        Corrida corrida = new Corrida();
        if (dto.getIdosoId() != null) {
            idosoRepository.findById(dto.getIdosoId()).ifPresent(corrida::setIdoso);
        }
        if (dto.getMotoristaId() != null) {
            motoristaRepository.findById(dto.getMotoristaId()).ifPresent(corrida::setMotorista);
        }
        if (dto.getOrigemId() != null) {
            enderecoRepository.findById(dto.getOrigemId()).ifPresent(corrida::setOrigem);
        }
        if (dto.getDestinoId() != null) {
            enderecoRepository.findById(dto.getDestinoId()).ifPresent(corrida::setDestino);
        }
        if (dto.getStatusCorrida() != null) {
            try {
                corrida.setStatusCorrida(Enuns.StatusCorrida.valueOf(dto.getStatusCorrida()));
            } catch (IllegalArgumentException ignored) { }
        }
        corrida.setDataHoraSolicitacao(dto.getDataHoraSolicitacao() != null ? dto.getDataHoraSolicitacao() : LocalDateTime.now());
        if (dto.getDataHoraInicio() != null) corrida.setDataHoraInicio(dto.getDataHoraInicio());
        if (dto.getDataHoraFim() != null) corrida.setDataHoraFim(dto.getDataHoraFim());
        if (dto.getValorTotal() != null) corrida.setValorTotal(dto.getValorTotal());
        if (dto.getValorCorrida() != null) corrida.setValorCorrida(dto.getValorCorrida());
        if (dto.getValorComissao() != null) corrida.setValorComissao(dto.getValorComissao());
        if (dto.getPercentualComissao() != null) corrida.setPercentualComissao(dto.getPercentualComissao());
        return addCorrida(corrida);
    }

    public Corrida addCorrida(Corrida corrida) {
        Corrida salva = this.repository.salvar(corrida);
        String desc = registrarDescricaoCorridas(salva);
        historicoService.registrar(Enuns.TipoAcao.CADASTRO.name(), Enuns.EntidadeAfetada.CORRIDA.name(), desc);
        return salva;
    }

    @Override
    public List<Corrida> getTodasCorridas() {
        return this.repository.getTodasCorridas();
    }

    @Override
    public Corrida getCorrida(Long id) {
        return this.repository.findById(id);
    }

    @Override
    @Transactional
    public void deletarCorrida(Long id) {
        VerificarNull.verificarNull(id);
        Corrida corrida = this.repository.findByIdWithEnderecosAndPessoas(id);
        VerificarNull.verificarNull(corrida);

        Long corridaId = VerificarNull.verificarNull(corrida.getId());
        Long motoristaId = VerificarNull.verificarNull(corrida.getMotorista().getId());
        Long idosoId =VerificarNull.verificarNull(corrida.getIdoso().getId());

        ;
        VerificarNull.verificarNull(motoristaId);
        VerificarNull.verificarNull(idosoId);

        String desc = "corridaId=" + corridaId + " | motoristaId=" + motoristaId + " | idosoId=" + idosoId
                + " | origemId=" + VerificarNull.verificarNull(corrida.getOrigem().getId()) + " | destinoId=" + VerificarNull.verificarNull(corrida.getDestino().getId());
        
        historicoService.registrar(Enuns.TipoAcao.EXCLUSAO.name(), Enuns.EntidadeAfetada.CORRIDA.name(), desc);
        this.repository.deleteById(corridaId);
        this.repository.flush();
    }

    @Override
    public ResponseEntity<Void> deletarCorridas(IdsRequestDTO request) {
        if (request == null || request.getIds() == null) {
            return ResponseEntity.badRequest().build();
        }
        request.getIds().stream().filter(Objects::nonNull).forEach(this::deletarCorrida);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Corrida> editarCorrida(Long id, CorridaRequestDTO dto) {
        VerificarNull.verificarNull(id);
        VerificarNull.verificarNull(dto);
        Corrida existente = this.repository.findByIdWithEnderecosAndPessoas(id);
        VerificarNull.verificarNull(existente);

        Long idMotoristaAntes = existente.getMotorista() != null ? existente.getMotorista().getId() : null;
        Long idIdosoAntes = existente.getIdoso() != null ? existente.getIdoso().getId() : null;
        Long idOrigemAntes = existente.getOrigem() != null ? existente.getOrigem().getId() : null;
        Long idDestinoAntes = existente.getDestino() != null ? existente.getDestino().getId() : null;
        Enuns.StatusCorrida statusAnterior = existente.getStatusCorrida();
        LocalDateTime dataHoraAnterior = existente.getDataHoraSolicitacao();
        LocalDateTime dataHoraInicioAntes = existente.getDataHoraInicio();
        LocalDateTime dataHoraFimAntes = existente.getDataHoraFim();
        java.math.BigDecimal valorTotalAntes = existente.getValorTotal();
        java.math.BigDecimal valorCorridaAntes = existente.getValorCorrida();
        java.math.BigDecimal valorComissaoAntes = existente.getValorComissao();
        Double percentualComissaoAntes = existente.getPercentualComissao();

        if (dto.getMotoristaId() != null) {
            motoristaRepository.findById(dto.getMotoristaId()).ifPresent(existente::setMotorista);
        }
        if (dto.getIdosoId() != null) {
            idosoRepository.findById(dto.getIdosoId()).ifPresent(existente::setIdoso);
        }
        if (dto.getOrigemId() != null) {
            enderecoRepository.findById(dto.getOrigemId()).ifPresent(existente::setOrigem);
        }
        if (dto.getDestinoId() != null) {
            enderecoRepository.findById(dto.getDestinoId()).ifPresent(existente::setDestino);
        }
        if (dto.getStatusCorrida() != null) {
            try {
                Enuns.StatusCorrida novoStatus = Enuns.StatusCorrida.valueOf(dto.getStatusCorrida());
                existente.setStatusCorrida(novoStatus);
                if (novoStatus == Enuns.StatusCorrida.EM_ANDAMENTO && dto.getDataHoraInicio() == null) {
                    existente.setDataHoraInicio(LocalDateTime.now());
                }
                if (novoStatus == Enuns.StatusCorrida.FINALIZADA) {
                    if (Boolean.TRUE.equals(dto.getFinalizarPelaTabela())) {
                        existente.setDataHoraFim(existente.getDataHoraInicio() != null ? existente.getDataHoraInicio() : LocalDateTime.now());
                    } else if (dto.getDuracaoSegundos() != null && existente.getDataHoraInicio() != null) {
                        existente.setDataHoraFim(existente.getDataHoraInicio().plusSeconds(dto.getDuracaoSegundos()));
                    } else if (dto.getDataHoraFim() == null) {
                        existente.setDataHoraFim(LocalDateTime.now());
                    }
                }
            } catch (IllegalArgumentException ignored) { }
        }
        if (dto.getDataHoraSolicitacao() != null) {
            existente.setDataHoraSolicitacao(dto.getDataHoraSolicitacao());
        }
        if (dto.getDataHoraInicio() != null) {
            existente.setDataHoraInicio(dto.getDataHoraInicio());
        }
        if (dto.getDataHoraFim() != null) {
            existente.setDataHoraFim(dto.getDataHoraFim());
        }
        if (dto.getValorTotal() != null) existente.setValorTotal(dto.getValorTotal());
        if (dto.getValorCorrida() != null) existente.setValorCorrida(dto.getValorCorrida());
        if (dto.getValorComissao() != null) existente.setValorComissao(dto.getValorComissao());
        if (dto.getPercentualComissao() != null) existente.setPercentualComissao(dto.getPercentualComissao());

        List<String> camposAlterados = new ArrayList<>();
        Long idMotoristaDepois = VerificarNull.verificarNull(existente.getMotorista().getId());
        Long idIdosoDepois = VerificarNull.verificarNull(existente.getIdoso().getId());
        Long idOrigemDepois = VerificarNull.verificarNull(existente.getOrigem().getId());
        Long idDestinoDepois = VerificarNull.verificarNull(existente.getDestino().getId());
        if (!Objects.equals(idMotoristaAntes, idMotoristaDepois)) {
            camposAlterados.add("motoristaId=" + idMotoristaAntes + " -> " + idMotoristaDepois);
        }
        if (!Objects.equals(idIdosoAntes, idIdosoDepois)) {
            camposAlterados.add("idosoId=" + idIdosoAntes + " -> " + idIdosoDepois);
        }
        if (!Objects.equals(idOrigemAntes, idOrigemDepois)) {
            camposAlterados.add("origemId=" + idOrigemAntes + " -> " + idOrigemDepois);
        }
        if (!Objects.equals(idDestinoAntes, idDestinoDepois)) {
            camposAlterados.add("destinoId=" + idDestinoAntes + " -> " + idDestinoDepois);
        }
        if (statusAnterior != existente.getStatusCorrida()) {
            camposAlterados.add("statusCorrida=" + (statusAnterior != null ? statusAnterior.name() : "?") + " -> " + existente.getStatusCorrida().name());
        }
        if (!Objects.equals(dataHoraAnterior, existente.getDataHoraSolicitacao())) {
            camposAlterados.add("dataHoraSolicitacao=" + dataHoraAnterior + " -> " + existente.getDataHoraSolicitacao());
        }
        if (!Objects.equals(dataHoraInicioAntes, existente.getDataHoraInicio())) {
            camposAlterados.add("dataHoraInicio=" + dataHoraInicioAntes + " -> " + existente.getDataHoraInicio());
        }
        if (!Objects.equals(dataHoraFimAntes, existente.getDataHoraFim())) {
            camposAlterados.add("dataHoraFim=" + dataHoraFimAntes + " -> " + existente.getDataHoraFim());
        }
        if (!Objects.equals(valorTotalAntes, existente.getValorTotal())) {
            camposAlterados.add("valorTotal=" + valorTotalAntes + " -> " + existente.getValorTotal());
        }
        if (!Objects.equals(valorCorridaAntes, existente.getValorCorrida())) {
            camposAlterados.add("valorCorrida=" + valorCorridaAntes + " -> " + existente.getValorCorrida());
        }
        if (!Objects.equals(valorComissaoAntes, existente.getValorComissao())) {
            camposAlterados.add("valorComissao=" + valorComissaoAntes + " -> " + existente.getValorComissao());
        }
        if (!Objects.equals(percentualComissaoAntes, existente.getPercentualComissao())) {
            camposAlterados.add("percentualComissao=" + percentualComissaoAntes + " -> " + existente.getPercentualComissao());
        }

        Corrida salva = this.repository.salvar(existente);
        String descBase = registrarDescricaoCorridas(salva);
        String camposDesc = camposAlterados.isEmpty() ? "nenhum" : String.join(", ", camposAlterados);
        historicoService.registrar(Enuns.TipoAcao.ATUALIZACAO.name(), Enuns.EntidadeAfetada.CORRIDA.name(),
                descBase + " | camposAtualizados=[" + camposDesc + "]");
        return ResponseEntity.ok(salva);
    }

    public ResponseEntity<Corrida> editarCorrida(Long id, Corrida corrida) {
        VerificarNull.verificarNull(id);
        VerificarNull.verificarNull(corrida);
        Corrida atualizada = editarCorridaContinuacao(id, corrida);
        VerificarNull.verificarNull(atualizada);
        return ResponseEntity.ok().build();
    }

    @Transactional
    public Corrida editarCorridaContinuacao(Long id, Corrida corrida) {
        VerificarNull.verificarNull(id);
        VerificarNull.verificarNull(corrida);

        Corrida existente = this.repository.findByIdWithEnderecosAndPessoas(id);
        VerificarNull.verificarNull(existente);

        Long idMotoristaAntes = existente.getMotorista() != null ? existente.getMotorista().getId() : null;
        Long idIdosoAntes = existente.getIdoso() != null ? existente.getIdoso().getId() : null;
        Enuns.StatusCorrida statusAnterior = existente.getStatusCorrida();
        LocalDateTime dataHoraAnterior = existente.getDataHoraSolicitacao();

        String[] origemAntes = valoresEndereco(existente.getOrigem());
        String[] destinoAntes = valoresEndereco(existente.getDestino());

        if (corrida.getMotorista() != null && corrida.getMotorista().getId() != null) {
            motoristaRepository.findById(corrida.getMotorista().getId()).ifPresent(existente::setMotorista);
        }

        if (corrida.getIdoso() != null && corrida.getIdoso().getId() != null) {
            idosoRepository.findById(corrida.getIdoso().getId()).ifPresent(existente::setIdoso);
        }

        if (corrida.getStatusCorrida() != null) {
            existente.setStatusCorrida(corrida.getStatusCorrida());
        }

        if (corrida.getDataHoraSolicitacao() != null) {
            existente.setDataHoraSolicitacao(corrida.getDataHoraSolicitacao());
        }

        if (corrida.getOrigem() != null && existente.getOrigem() != null) {
            atualizarEnderecoSePreenchido(corrida.getOrigem(), existente.getOrigem());
        }

        if (corrida.getDestino() != null && existente.getDestino() != null) {
            atualizarEnderecoSePreenchido(corrida.getDestino(), existente.getDestino());
        }

        List<String> camposAlterados = new ArrayList<>();
        if (corrida.getMotorista() != null && corrida.getMotorista().getId() != null && !Objects.equals(idMotoristaAntes, corrida.getMotorista().getId())) {
            camposAlterados.add("motoristaId=" + idMotoristaAntes + " -> " + corrida.getMotorista().getId());
        }

        if (corrida.getIdoso() != null && corrida.getIdoso().getId() != null && !Objects.equals(idIdosoAntes, corrida.getIdoso().getId())) {
            camposAlterados.add("idosoId=" + idIdosoAntes + " -> " + corrida.getIdoso().getId());
        }

        if (corrida.getStatusCorrida() != null && statusAnterior != existente.getStatusCorrida()) {
            camposAlterados.add("statusCorrida=" + (statusAnterior != null ? statusAnterior.name() : "?") + " -> " + existente.getStatusCorrida().name());
        }

        if (corrida.getDataHoraSolicitacao() != null && !Objects.equals(dataHoraAnterior, existente.getDataHoraSolicitacao())) {
            camposAlterados.add("dataHoraSolicitacao=" + dataHoraAnterior + " -> " + existente.getDataHoraSolicitacao());
        }

        String[] origemDepois = valoresEndereco(existente.getOrigem());
        String[] destinoDepois = valoresEndereco(existente.getDestino());
        adicionarCamposEnderecoAlteradosComValores(camposAlterados, "origem", origemAntes, origemDepois);
        adicionarCamposEnderecoAlteradosComValores(camposAlterados, "destino", destinoAntes, destinoDepois);

        Corrida salva = this.repository.salvar(existente);
        String descBase = registrarDescricaoCorridas(existente);
        String camposDesc = camposAlterados.isEmpty() ? "nenhum" : String.join(", ", camposAlterados);

        historicoService.registrar(Enuns.TipoAcao.ATUALIZACAO.name(), Enuns.EntidadeAfetada.CORRIDA.name(),
                descBase + " | camposAtualizados=[" + camposDesc + "]");

        return salva;
    }

    /**
     * Cria uma corrida para o par motorista-idoso do relacionamento, se ainda não existir.
     * Origem e destino são do motorista. Chamado ao cadastrar um relacionamento.
     */
    @Transactional
    public void criarCorridaParaRelacionamento(Long relacionamentoId) {
        VerificarNull.verificarNull(relacionamentoId);
        Optional<RelacionamentoMotoristaIdoso> relOpt = relacionamentoRepository.findByIdComMotoristaEIdoso(relacionamentoId);
        VerificarNull.verificarNull(relOpt);
    
        RelacionamentoMotoristaIdoso rel = relOpt.get();
        VerificarNull.verificarNull(rel.getMotorista());
        VerificarNull.verificarNull(rel.getIdoso());

        Long idosoId = VerificarNull.verificarNull(rel.getIdoso().getId());
        Long motoristaId = VerificarNull.verificarNull(rel.getMotorista().getId());

        if (repository.existeCorridaComIdosoEMotorista(idosoId, motoristaId)) {
            return;
        }
        Corrida nova = new Corrida();
        nova.setIdoso(rel.getIdoso());
        nova.setMotorista(rel.getMotorista());
        nova.setStatusCorrida(Enuns.StatusCorrida.SOLICITADA);
        nova.setDataHoraSolicitacao(LocalDateTime.now());
        nova.setOrigem(rel.getMotorista().getEnderecoOrigem());
        nova.setDestino(rel.getMotorista().getEnderecoDestino());
        Corrida criada = repository.salvar(nova);

        String desc = registrarDescricaoCorridas(criada) + " (a partir de relacionamento)";
        historicoService.registrar("CADASTRO", "CORRIDA", desc);
    }

    private static String[] valoresEndereco(Endereco e) {
        if (e == null) return new String[] { null, null, null, null };
        return new String[] { e.getLogradouro(), e.getNumero(), e.getCidade(), e.getEstado() };
    }

    private static String valorDesc(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    private static void adicionarCamposEnderecoAlteradosComValores(List<String> out, String prefixo, String[] antes, String[] depois) {
        String[] nomes = { "logradouro", "numero", "cidade", "estado" };
        for (int i = 0; i < 4; i++) {
            boolean alterado = (antes[i] == null && depois[i] != null) || (antes[i] != null && !antes[i].equals(depois[i]));
            if (alterado) {
                out.add(prefixo + "." + nomes[i] + "=" + valorDesc(antes[i]) + " -> " + valorDesc(depois[i]));
            }
        }
    }

    private String registrarDescricaoCorridas(Corrida c)  {
        Long corridaId = VerificarNull.verificarNull(c.getId());
        Long motoristaId = VerificarNull.verificarNull(c.getMotorista().getId());
        Long idosoId = VerificarNull.verificarNull(c.getIdoso().getId());
        Long origemId = VerificarNull.verificarNull(c.getOrigem().getId());
        Long destinoId = VerificarNull.verificarNull(c.getDestino().getId());

        return "corridaId=" + corridaId + " | motoristaId=" + motoristaId + " | idosoId=" + idosoId
                + " | origemId=" + origemId + " | destinoId=" + destinoId;
    }

    private void atualizarEnderecoSePreenchido(Endereco origem, Endereco existente) {
        VerificarNull.verificarNull(origem);
        VerificarNull.verificarNull(existente);

        VerificarNull.verificarNull(origem.getLogradouro());
        VerificarNull.verificarNull(origem.getNumero());
        VerificarNull.verificarNull(origem.getCidade());
        VerificarNull.verificarNull(origem.getEstado());

        existente.setLogradouro(origem.getLogradouro());
        existente.setNumero(origem.getNumero());
        existente.setCidade(origem.getCidade());
        existente.setEstado(origem.getEstado());
    }
}
