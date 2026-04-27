package com.idoso.uber.ports.out;

import java.util.List;

import com.idoso.uber.domain.model.Corrida;

public interface CorridaRepositoryPort {

    Corrida salvar(Corrida corrida);

    Corrida findById(Long id);

    Corrida findByIdWithEnderecosAndPessoas(Long id);

    List<Corrida> getTodasCorridas();

    void deleteById(Long id);

    void flush();

    boolean existeAlgumaCorridaComMotoristaId(Long motoristaId);

    boolean existeAlgumaCorridaComIdosoId(Long idosoId);

    /**
     * Verifica se já existe alguma corrida com o par idosoId e motoristaId.
     */
    boolean existeCorridaComIdosoEMotorista(Long idosoId, Long motoristaId);
}
