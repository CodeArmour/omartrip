package com.omarabusahmoud.portfolio.assistant.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.omarabusahmoud.portfolio.assistant.config.AssistantProperties;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class PortfolioAssistantServiceTests {

    @Test
    void introducesItselfAsOmiWithoutCallingOpenAi() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        var response = service.answer("Who are you?");

        assertThat(response.mode()).isEqualTo("local");
        assertThat(response.message()).contains("I'm Omi", "Omar's right hand", "portfolio assistant");
    }

    @Test
    void understandsConversationalIdentityShorthand() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        for (String question : new String[] {"who are u", "who r u", "whats ur name"}) {
            assertThat(service.answer(question).message())
                    .as("identity response for: %s", question)
                    .contains("I'm Omi", "Omar's right hand", "portfolio assistant");
        }
    }

    @Test
    void asksAClarifyingQuestionWhenIntentIsUnknown() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        var response = service.answer("Tell me something unexpected");

        assertThat(response.mode()).isEqualTo("local");
        assertThat(response.message())
                .contains("understand you correctly", "projects", "skills", "contact him")
                .endsWith("?");
    }

    @Test
    void recognizesNaturalGetInTouchLanguageAsContactIntent() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        var response = service.answer("How can I get in touch with Omar?");

        assertThat(response.mode()).isEqualTo("local");
        assertThat(response.message()).contains("Book a Call", "GitHub", "link below");
        assertThat(response.actionLabel()).isEqualTo("Open contact links");
        assertThat(response.target()).isEqualTo("links");
        assertThat(response.message()).doesNotContain("Software Engineer based in Brussels");
    }

    @Test
    void recognizesDifferentWaysVisitorsAskToContactOmar() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        for (String question : new String[] {
                "Can I reach out to Omar?",
                "I want to collaborate with him",
                "How do I schedule a meeting?",
                "Can I send Omar a message?",
                "I'd like to work together"
        }) {
            assertThat(service.answer(question).message())
                    .as("contact response for: %s", question)
                    .contains("Book a Call", "link below");
        }
    }

    @Test
    void toleratesSmallTypingMistakesWhenDetectingIntent() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        assertThat(service.answer("wjo are you").message())
                .contains("I'm Omi", "portfolio assistant");
        assertThat(service.answer("how can i contcat omar").message())
                .contains("Book a Call", "link below");
        assertThat(service.answer("show me his projcts").message())
                .contains("Moon Glow", "link below");
        assertThat(service.answer("what skils does omar have").message())
                .contains("Next.js", "Spring Boot", "link below");
    }

    @Test
    void removesMarkdownAndDecorativePunctuationFromGeneratedReplies() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        String formatted = service.formatForChat(
                "## Hello\n- I'm __Omi__, Omar's **assistant** — explore [`Projects`](/projects)."
        );

        assertThat(formatted)
                .isEqualTo("Hello\nI'm Omi, Omar's assistant, explore Projects.")
                .doesNotContain("__", "**", "`", "—", "##", "- ");
    }

    @Test
    void givesProfessionalPreparationStepsForContactAdvice() {
        AssistantProperties properties = new AssistantProperties(
                "", "gpt-5.6-luna", "text-embedding-3-small", 30);
        PortfolioAssistantService service = new PortfolioAssistantService(
                properties, mock(AssistantKnowledgeService.class), RestClient.builder());

        var response = service.answer("Give me advice that makes contacting Omar more useful");

        assertThat(response.message())
                .contains(
                        "1. Book a 30-minute call",
                        "2. Prepare a short summary",
                        "files, designs, or examples",
                        "timeline",
                        "budget range",
                        "questions or decisions");
        assertThat(response.actionLabel()).isEqualTo("Book a 30-minute call");
        assertThat(response.target()).isEqualTo("book");
    }
}
