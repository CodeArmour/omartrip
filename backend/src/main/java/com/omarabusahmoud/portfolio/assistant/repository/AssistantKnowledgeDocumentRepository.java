package com.omarabusahmoud.portfolio.assistant.repository;

import java.util.UUID;

import com.omarabusahmoud.portfolio.assistant.entity.AssistantKnowledgeDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantKnowledgeDocumentRepository extends JpaRepository<AssistantKnowledgeDocumentEntity, UUID> {
}
