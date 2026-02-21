package com.idoso.uber.application.service;

import com.idoso.uber.ports.in.RotaUseCase;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class RotaService implements RotaUseCase {

    private final RotaExternalService rotaExternalService;

    public RotaService(RotaExternalService rotaExternalService) {
        this.rotaExternalService = rotaExternalService;
    }

    @Override
    public ResponseEntity<double[]> geocodificar(String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        double[] coords = rotaExternalService.geocodificar(q);
        if (coords == null || coords.length < 2) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(coords);
    }

    @Override
    public ResponseEntity<List<double[]>> roteamento(String origem, String destino) {
        double[] orig = parseLatLon(origem);
        double[] dest = parseLatLon(destino);
        if (orig == null || dest == null) {
            return ResponseEntity.badRequest().build();
        }
        List<double[]> rota = rotaExternalService.obterRota(orig, dest);
        if (rota == null || rota.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(rota);
    }

    private static double[] parseLatLon(String s) {
        if (s == null || s.isBlank()) return null;
        String[] parts = s.split(",");
        if (parts.length != 2) return null;
        try {
            double lat = Double.parseDouble(parts[0].trim());
            double lon = Double.parseDouble(parts[1].trim());
            return new double[]{lat, lon};
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
