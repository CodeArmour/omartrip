package com.omarabusahmoud.portfolio.assistant.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "assistant_knowledge_documents")
public class AssistantKnowledgeDocumentEntity {
    @Id private UUID id;
    @Column(nullable = false, unique = true) private String slug;
    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "text") private String content;
    @Column(nullable = false) private String keywords;
    @Column(columnDefinition = "text") private String embedding;
    private String embeddingModel;
    @Column(nullable = false) private Instant updatedAt;

    protected AssistantKnowledgeDocumentEntity() {}

    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getKeywords() { return keywords; }
    public String getEmbedding() { return embedding; }
    public String getEmbeddingModel() { return embeddingModel; }
    public void setEmbedding(String embedding, String model) {
        this.embedding = embedding;
        this.embeddingModel = model;
        this.updatedAt = Instant.now();
    }
}
