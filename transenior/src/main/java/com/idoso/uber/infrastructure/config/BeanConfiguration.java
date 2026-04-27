package com.idoso.uber.infrastructure.config;

import com.idoso.uber.adapters.out.persistence.CorridaJpaAdapter;
import com.idoso.uber.application.service.CorridaService;
import com.idoso.uber.application.service.DadosSistemaService;
import com.idoso.uber.application.service.HistoricoService;
import com.idoso.uber.application.service.RelacionamentoMotoristaIdosoService;
import com.idoso.uber.infrastructure.repository.CorridaJpaRepository;
import com.idoso.uber.infrastructure.repository.EnderecoJpaRepository;
import com.idoso.uber.infrastructure.repository.IdosoJpaRepository;
import com.idoso.uber.infrastructure.repository.MotoristaJpaRepository;
import com.idoso.uber.infrastructure.repository.RelacionamentoMotoristaIdosoRepository;
import com.idoso.uber.ports.in.RelacionamentoMotoristaIdosoUseCase;
import com.idoso.uber.ports.out.CorridaRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfiguration {

    @Bean
    CorridaRepositoryPort corridaRepositoryPort(CorridaJpaRepository repo) {
        return new CorridaJpaAdapter(repo);
    }

    @Bean
    RelacionamentoMotoristaIdosoUseCase relacionamentoMotoristaIdosoUseCase(
            RelacionamentoMotoristaIdosoRepository relacionamentoRepository,
            MotoristaJpaRepository motoristaRepository,
            IdosoJpaRepository idosoRepository,
            HistoricoService historicoService,
            CorridaService corridaService,
            DadosSistemaService dadosSistemaService) {
        return new RelacionamentoMotoristaIdosoService(relacionamentoRepository, motoristaRepository, idosoRepository, historicoService, corridaService, dadosSistemaService);
    }
}
