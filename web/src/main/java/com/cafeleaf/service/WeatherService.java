package com.cafeleaf.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherService {

    private static final Map<String, double[]> PROVINCE_COORDS = new LinkedHashMap<>();
    private static final Map<String, String> PROVINCE_PRICE = new LinkedHashMap<>();
    private static final Map<String, List<Integer>> PROVINCE_FALLBACK_RAIN = new LinkedHashMap<>();

    static {
        PROVINCE_COORDS.put("Đắk Lắk", new double[]{12.6667, 108.0500});
        PROVINCE_COORDS.put("Lâm Đồng", new double[]{11.5480, 107.8077});
        PROVINCE_COORDS.put("Gia Lai", new double[]{13.9833, 108.0000});
        PROVINCE_COORDS.put("Đắk Nông", new double[]{12.0042, 107.6907});
        PROVINCE_COORDS.put("Kon Tum", new double[]{14.3545, 108.0076});
        PROVINCE_COORDS.put("Sơn La", new double[]{21.3256, 103.9188});
        PROVINCE_COORDS.put("Điện Biên", new double[]{21.3860, 103.0230});
        PROVINCE_COORDS.put("Quảng Trị", new double[]{16.6260, 106.7310});
        PROVINCE_COORDS.put("Đồng Nai", new double[]{10.9574, 107.2427});
        PROVINCE_COORDS.put("Bình Phước", new double[]{11.7512, 106.7235});

        PROVINCE_PRICE.put("Đắk Lắk", "119.600 đ/kg (+300 đ)");
        PROVINCE_PRICE.put("Lâm Đồng", "118.800 đ/kg (+200 đ)");
        PROVINCE_PRICE.put("Gia Lai", "119.300 đ/kg (+300 đ)");
        PROVINCE_PRICE.put("Đắk Nông", "119.700 đ/kg (+400 đ)");
        PROVINCE_PRICE.put("Kon Tum", "119.200 đ/kg (+200 đ)");
        PROVINCE_PRICE.put("Sơn La", "122.500 đ/kg (Arabica)");
        PROVINCE_PRICE.put("Điện Biên", "123.000 đ/kg (Arabica)");
        PROVINCE_PRICE.put("Quảng Trị", "121.800 đ/kg (Arabica Khe Sanh)");
        PROVINCE_PRICE.put("Đồng Nai", "119.000 đ/kg (+200 đ)");
        PROVINCE_PRICE.put("Bình Phước", "119.100 đ/kg (+250 đ)");

        PROVINCE_FALLBACK_RAIN.put("Đắk Lắk", List.of(2, 5, 8, 4, 1, 0, 3));
        PROVINCE_FALLBACK_RAIN.put("Lâm Đồng", List.of(6, 9, 12, 5, 3, 2, 4));
        PROVINCE_FALLBACK_RAIN.put("Gia Lai", List.of(3, 4, 7, 2, 0, 1, 2));
        PROVINCE_FALLBACK_RAIN.put("Đắk Nông", List.of(4, 8, 10, 6, 2, 1, 3));
        PROVINCE_FALLBACK_RAIN.put("Kon Tum", List.of(5, 3, 2, 0, 0, 1, 4));
        PROVINCE_FALLBACK_RAIN.put("Sơn La", List.of(1, 0, 2, 6, 4, 0, 0));
        PROVINCE_FALLBACK_RAIN.put("Điện Biên", List.of(0, 1, 3, 5, 2, 0, 1));
        PROVINCE_FALLBACK_RAIN.put("Quảng Trị", List.of(8, 14, 9, 4, 2, 1, 3));
    }

    private final Map<String, List<Integer>> rainCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTime = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Integer> get7DayRainMm(String province) {
        String prov = (province == null || province.isBlank()) ? "Đắk Lắk" : province.trim();
        long now = System.currentTimeMillis();
        Long lastTime = cacheTime.get(prov);
        if (lastTime != null && (now - lastTime < 900_000L) && rainCache.containsKey(prov)) {
            return rainCache.get(prov);
        }

        double[] coords = PROVINCE_COORDS.getOrDefault(prov, new double[]{12.6667, 108.0500});
        try {
            String url = String.format(Locale.US,
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&daily=precipitation_sum&timezone=Asia%%2FHo_Chi_Minh&forecast_days=7",
                coords[0], coords[1]);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode root = mapper.readTree(resp.body());
                JsonNode arr = root.path("daily").path("precipitation_sum");
                if (arr.isArray() && arr.size() >= 7) {
                    List<Integer> list = new ArrayList<>();
                    for (int i = 0; i < 7; i++) {
                        list.add((int) Math.round(arr.get(i).asDouble(0.0)));
                    }
                    rainCache.put(prov, list);
                    cacheTime.put(prov, now);
                    return list;
                }
            }
        } catch (Exception ignored) {
        }

        // Cache cả kết quả dự phòng (fallback) trong 5 phút để các request tiếp theo không bị chờ timeout 3s
        List<Integer> fallback = PROVINCE_FALLBACK_RAIN.getOrDefault(prov, List.of(2, 4, 6, 3, 1, 0, 2));
        rainCache.put(prov, fallback);
        cacheTime.put(prov, now - 600_000L); // TTL 5 phút (900_000 - 600_000 = 300_000 ms)
        return fallback;
    }

    public String getCoffeePriceForProvince(String province) {
        String prov = (province == null || province.isBlank()) ? "Đắk Lắk" : province.trim();
        return PROVINCE_PRICE.getOrDefault(prov, "119.500 đ/kg (Nhân xô Tây Nguyên)");
    }
}