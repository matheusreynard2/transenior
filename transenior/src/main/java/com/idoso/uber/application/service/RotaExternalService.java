package com.idoso.uber.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import org.springframework.boot.web.client.RestTemplateBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Serviço que faz proxy das chamadas a Nominatim (geocoding) e OSRM (roteamento)
 * para evitar CORS quando o frontend chama a partir do navegador.
 * Nominatim exige User-Agent identificando a aplicação.
 */
@Service
public class RotaExternalService {

    private static final String NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
    private static final String OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
    private static final String USER_AGENT = "Transenior/1.0 (app transporte idosos)";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public RotaExternalService(RestTemplateBuilder builder, ObjectMapper objectMapper) {
        this.restTemplate = builder
                .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
                .build();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /**
     * Geocodifica um endereço via Nominatim. Retorna [lat, lon] ou null.
     */
    public double[] geocodificar(String endereco) {
        if (endereco == null || endereco.isBlank()) return null;
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE)
                .queryParam("q", endereco)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .build()
                .toUriString();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, USER_AGENT);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            ResponseEntity<List> res = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    List.class
            );
            if (res.getBody() == null || res.getBody().isEmpty()) return null;
            @SuppressWarnings("unchecked")
            Map<String, Object> first = (Map<String, Object>) res.getBody().get(0);
            String latStr = (String) first.get("lat");
            String lonStr = (String) first.get("lon");
            if (latStr == null || lonStr == null) return null;
            double lat = Double.parseDouble(latStr);
            double lon = Double.parseDouble(lonStr);
            return new double[]{lat, lon};
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Obtém a rota (lista de coordenadas [lat, lon]) entre origem e destino via OSRM.
     * Usa java.net.http.HttpClient para preservar o ponto e vírgula no path (evita encoding que quebra o OSRM).
     * origem e destino são [lat, lon]. Se OSRM falhar, retorna fallback em linha reta.
     */
    @SuppressWarnings("unchecked")
    public List<double[]> obterRota(double[] origem, double[] destino) {
        if (origem == null || origem.length < 2 || destino == null || destino.length < 2) return null;
        List<double[]> fallback = List.of(origem.clone(), destino.clone());
        String coords = String.format(Locale.ROOT, "%.6f,%.6f;%.6f,%.6f", origem[1], origem[0], destino[1], destino[0]);
        String urlString = OSRM_BASE + "/" + coords + "?overview=full&geometries=geojson";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlString))
                    .header("User-Agent", USER_AGENT)
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) return fallback;
            Map<String, Object> body = objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            
            if (body == null) return fallback;
            Object code = body.get("code");
            if ("NoRoute".equals(code) || "InvalidQuery".equals(code)) return fallback;
            List<?> routes = (List<?>) body.get("routes");
            if (routes == null || routes.isEmpty()) return fallback;
            Object routeObj = routes.get(0);
            if (!(routeObj instanceof Map)) return fallback;
            Map<String, Object> route = (Map<String, Object>) routeObj;
            Object geomObj = route.get("geometry");
            if (!(geomObj instanceof Map)) return fallback;
            Map<String, Object> geometry = (Map<String, Object>) geomObj;
            Object coordsObj = geometry.get("coordinates");
            if (!(coordsObj instanceof List)) return fallback;
            List<?> coordinates = (List<?>) coordsObj;
            if (coordinates.isEmpty()) return fallback;
            List<double[]> result = new ArrayList<>();
            for (Object point : coordinates) {
                if (!(point instanceof List) || ((List<?>) point).size() < 2) continue;
                List<?> p = (List<?>) point;
                double lon = toDouble(p.get(0));
                double lat = toDouble(p.get(1));
                result.add(new double[]{lat, lon});
            }
            return result.isEmpty() ? fallback : result;
        } catch (Exception e) {
            return fallback;
        }
    }

    private static double toDouble(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        if (o != null) return Double.parseDouble(o.toString());
        return 0;
    }
}
