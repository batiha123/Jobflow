package com.team.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.backend.dto.AiAnalysisDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class AiAnalysisService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public AiAnalysisDto.Response analyzeCv(AiAnalysisDto.Request request) {
        // Try calling real Google Gemini AI first
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return callGeminiApi(request.getCandidateSkills(), request.getJobRequirements());
            } catch (Exception e) {
                System.err.println("[AI] Gemini API failed, falling back to local matcher: " + e.getMessage());
            }
        }
        // Fallback: Smart local keyword analysis
        return localFallbackAnalysis(request.getCandidateSkills(), request.getJobRequirements());
    }

    private AiAnalysisDto.Response callGeminiApi(String candidateSkills, String jobRequirements) throws Exception {
        String prompt = "Tu es un expert RH en recrutement. Compare les compétences du candidat avec les exigences du poste.\n"
                + "Compétences Candidat: " + candidateSkills + "\n"
                + "Exigences du poste: " + jobRequirements + "\n\n"
                + "Réponds UNIQUEMENT avec un JSON brut sans markdown ni apostrophes inversées suivant ce schéma:\n"
                + "{\n"
                + "  \"matchScore\": 85,\n"
                + "  \"matchLevel\": \"STRONG\",\n"
                + "  \"matchedSkills\": [\"Java\", \"Spring Boot\"],\n"
                + "  \"missingSkills\": [\"Docker\"],\n"
                + "  \"summary\": \"Excellente adéquation technique sur le backend Java avec une légère lacune sur les conteneurs.\"\n"
                + "}";

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        String requestBodyJson = objectMapper.writeValueAsString(body);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(httpResponse.body());
            String rawJsonText = root.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText().trim();

            // Strip potential markdown ```json blocks
            if (rawJsonText.startsWith("```json")) {
                rawJsonText = rawJsonText.substring(7);
            }
            if (rawJsonText.startsWith("```")) {
                rawJsonText = rawJsonText.substring(3);
            }
            if (rawJsonText.endsWith("```")) {
                rawJsonText = rawJsonText.substring(0, rawJsonText.length() - 3);
            }

            return objectMapper.readValue(rawJsonText.trim(), AiAnalysisDto.Response.class);
        }

        throw new RuntimeException("Gemini returned status " + httpResponse.statusCode() + ": " + httpResponse.body());
    }

    private AiAnalysisDto.Response localFallbackAnalysis(String candidateSkills, String jobRequirements) {
        String cSkills = candidateSkills != null ? candidateSkills.toLowerCase() : "";
        String jReqs = jobRequirements != null ? jobRequirements.toLowerCase() : "";

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        String[] requiredKeywords = jReqs.split("[,;\\s]+");
        for (String word : requiredKeywords) {
            word = word.trim();
            if (word.length() > 2) {
                if (cSkills.contains(word)) {
                    if (!matched.contains(word)) matched.add(word);
                } else {
                    if (!missing.contains(word)) missing.add(word);
                }
            }
        }

        int total = matched.size() + missing.size();
        int score = total > 0 ? (int) Math.round(((double) matched.size() / total) * 100) : 50;
        String level = score >= 75 ? "STRONG" : (score >= 45 ? "MODERATE" : "LOW");
        String summary = "Score d'adéquation de " + score + "% basé sur l'analyse comparative des compétences.";

        return new AiAnalysisDto.Response(score, level, matched, missing, summary);
    }
}