package com.idoso.uber.adapters.out.persistence;

import java.util.List;

import com.idoso.uber.domain.model.Corrida;
import com.idoso.uber.infrastructure.repository.CorridaJpaRepository;
import com.idoso.uber.ports.out.CorridaRepositoryPort;

public class CorridaJpaAdapter implements CorridaRepositoryPort {

    private final CorridaJpaRepository repository;

    public CorridaJpaAdapter(CorridaJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Corrida salvar(Corrida corrida) {
        return repository.save(corrida);
    }

    @Override
    public List<Corrida> getTodasCorridas() {
        return repository.findAllWithEnderecosAndPessoas();
    }

    @Override
    public Corrida findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Corrida findByIdWithEnderecosAndPessoas(Long id) {
        return repository.findByIdWithEnderecosAndPessoas(id).orElse(null);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public void flush() {
        repository.flush();
    }

    @Override
    public boolean existeCorridaComIdosoEMotorista(Long idosoId, Long motoristaId) {
        return repository.existsByIdosoIdAndMotoristaId(idosoId, motoristaId);
    }

    @Override
    public boolean existeAlgumaCorridaComMotoristaId(Long motoristaId) {
        return repository.existsByMotoristaId(motoristaId);
    }

    @Override
    public boolean existeAlgumaCorridaComIdosoId(Long idosoId) {
        return repository.existsByIdosoId(idosoId);
    }
}
