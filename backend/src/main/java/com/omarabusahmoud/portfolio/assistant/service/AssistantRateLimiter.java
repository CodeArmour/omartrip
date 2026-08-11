package com.omarabusahmoud.portfolio.assistant.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

import com.omarabusahmoud.portfolio.assistant.config.AssistantProperties;
import com.omarabusahmoud.portfolio.assistant.exception.AssistantRateLimitException;
import org.springframework.stereotype.Service;

@Service
public class AssistantRateLimiter {
    private final AssistantProperties properties;
    private final Clock clock;
    private final Deque<Instant> requests = new ArrayDeque<>();

    public AssistantRateLimiter(AssistantProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public synchronized void acquire() {
        Instant cutoff = clock.instant().minus(Duration.ofHours(1));
        while (!requests.isEmpty() && requests.peekFirst().isBefore(cutoff)) requests.removeFirst();
        if (requests.size() >= properties.maxRequestsPerHour()) throw new AssistantRateLimitException();
        requests.addLast(clock.instant());
    }
}
