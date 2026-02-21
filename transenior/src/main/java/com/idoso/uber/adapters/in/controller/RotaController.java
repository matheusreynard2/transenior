package com.idoso.uber.adapters.in.controller;

import com.idoso.uber.domain.requests_dtos.GeocodificarRequestDTO;
import com.idoso.uber.domain.requests_dtos.RoteamentoRequestDTO;
import com.idoso.uber.ports.in.RotaUseCase;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/rota")
public class RotaController {

    private final RotaUseCase rotaUseCase;

    public RotaController(RotaUseCase rotaUseCase) {
        this.rotaUseCase = rotaUseCase;
    }

    @PostMapping("/geocodificar")
    public ResponseEntity<double[]> geocodificar(@RequestBody GeocodificarRequestDTO request) {
        String q = request != null ? request.getQ() : null;
        return rotaUseCase.geocodificar(q);
    }

    @GetMapping("/geocodificar")
    public ResponseEntity<double[]> geocodificarGet(@RequestParam String q) {
        return rotaUseCase.geocodificar(q);
    }

    @PostMapping("/roteamento")
    public ResponseEntity<List<double[]>> roteamento(@RequestBody RoteamentoRequestDTO request) {
        String origem = request != null ? request.getOrigem() : null;
        String destino = request != null ? request.getDestino() : null;
        return rotaUseCase.roteamento(origem, destino);
    }

    @GetMapping("/roteamento")
    public ResponseEntity<List<double[]>> roteamentoGet(
            @RequestParam String origem,
            @RequestParam String destino) {
        return rotaUseCase.roteamento(origem, destino);
    }
}
