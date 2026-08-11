package com.omarabusahmoud.portfolio.assistant.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.omarabusahmoud.portfolio.assistant.config.AssistantProperties;
import com.omarabusahmoud.portfolio.assistant.entity.AssistantKnowledgeDocumentEntity;
import com.omarabusahmoud.portfolio.assistant.repository.AssistantKnowledgeDocumentRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class AssistantKnowledgeService {
    private final AssistantKnowledgeDocumentRepository repository;
    private final AssistantProperties properties;
    private final RestClient openai;

    public AssistantKnowledgeService(
            AssistantKnowledgeDocumentRepository repository,
            AssistantProperties properties,
            RestClient.Builder builder) {
        this.repository = repository;
        this.properties = properties;
        this.openai = builder.baseUrl("https://api.openai.com/v1").build();
    }

    @Transactional
    public String retrieveContext(String question) {
        List<AssistantKnowledgeDocumentEntity> documents = repository.findAll();
        if (documents.isEmpty()) return "No portfolio context is available.";

        List<Double> queryEmbedding = null;
        if (properties.openaiConfigured()) {
            try {
                ensureDocumentEmbeddings(documents);
                queryEmbedding = embed(List.of(question)).getFirst();
            } catch (RuntimeException ignored) {
                queryEmbedding = null;
            }
        }

        List<Double> finalQueryEmbedding = queryEmbedding;
        return documents.stream()
                .map(document -> new ScoredDocument(document, score(document, question, finalQueryEmbedding)))
                .sorted(Comparator.comparingDouble(ScoredDocument::score).reversed())
                .limit(3)
                .map(item -> "[" + item.document().getTitle() + "] " + item.document().getContent())
                .collect(Collectors.joining("\n"));
    }

    private synchronized void ensureDocumentEmbeddings(List<AssistantKnowledgeDocumentEntity> documents) {
        List<AssistantKnowledgeDocumentEntity> missing = documents.stream()
                .filter(document -> document.getEmbedding() == null
                        || !properties.embeddingModel().equals(document.getEmbeddingModel()))
                .toList();
        if (missing.isEmpty()) return;

        List<String> inputs = missing.stream()
                .map(document -> document.getTitle() + "\n" + document.getContent() + "\n" + document.getKeywords())
                .toList();
        List<List<Double>> embeddings = embed(inputs);
        for (int index = 0; index < missing.size(); index++) {
            missing.get(index).setEmbedding(serialize(embeddings.get(index)), properties.embeddingModel());
        }
        repository.saveAll(missing);
    }

    private List<List<Double>> embed(List<String> inputs) {
        EmbeddingResponse response = openai.post()
                .uri("/embeddings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.openaiApiKey())
                .body(Map.of("model", properties.embeddingModel(), "input", inputs))
                .retrieve()
                .body(EmbeddingResponse.class);
        if (response == null || response.data() == null || response.data().size() != inputs.size()) {
            throw new IllegalStateException("Embedding response was incomplete");
        }
        return response.data().stream()
                .sorted(Comparator.comparingInt(EmbeddingData::index))
                .map(EmbeddingData::embedding)
                .toList();
    }

    private double score(AssistantKnowledgeDocumentEntity document, String question, List<Double> queryEmbedding) {
        double lexical = lexicalScore(document, question);
        if (queryEmbedding == null || document.getEmbedding() == null) return lexical;
        return cosine(queryEmbedding, parse(document.getEmbedding())) * 0.82 + lexical * 0.18;
    }

    private double lexicalScore(AssistantKnowledgeDocumentEntity document, String question) {
        Set<String> terms = tokens(question);
        if (terms.isEmpty()) return 0;
        Set<String> documentTerms = tokens(document.getTitle() + " " + document.getContent() + " " + document.getKeywords());
        long matches = terms.stream().filter(documentTerms::contains).count();
        return (double) matches / terms.size();
    }

    private Set<String> tokens(String value) {
        return Arrays.stream(value.toLowerCase(Locale.ROOT).split("[^a-z0-9+#.]+"))
                .filter(token -> token.length() > 1)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private double cosine(List<Double> left, List<Double> right) {
        if (left.size() != right.size() || left.isEmpty()) return 0;
        double dot = 0, leftNorm = 0, rightNorm = 0;
        for (int index = 0; index < left.size(); index++) {
            dot += left.get(index) * right.get(index);
            leftNorm += left.get(index) * left.get(index);
            rightNorm += right.get(index) * right.get(index);
        }
        return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
    }

    private String serialize(List<Double> embedding) {
        return embedding.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Double> parse(String value) {
        List<Double> result = new ArrayList<>();
        for (String item : value.split(",")) result.add(Double.parseDouble(item));
        return result;
    }

    private record ScoredDocument(AssistantKnowledgeDocumentEntity document, double score) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EmbeddingResponse(List<EmbeddingData> data) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EmbeddingData(int index, List<Double> embedding) {}
}
