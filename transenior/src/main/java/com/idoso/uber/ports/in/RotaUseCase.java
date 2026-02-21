package com.idoso.uber.ports.in;

import java.util.List;

import org.springframework.http.ResponseEntity;

public interface RotaUseCase {

    /**
     * Geocodifica um endereço. Retorna 400 se q for null ou em branco, 404 se não encontrar, 200 com [lat, lon].
     */
    ResponseEntity<double[]> geocodificar(String q);

    /**
     * Obtém a rota entre dois pontos (origem e destino no formato "lat,lon").
     * Retorna 400 se inválido, 404 se rota vazia, 200 com lista de coordenadas.
     */
    ResponseEntity<List<double[]>> roteamento(String origem, String destino);
}
