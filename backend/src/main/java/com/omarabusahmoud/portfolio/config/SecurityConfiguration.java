package com.omarabusahmoud.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthenticationSuccessHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class SecurityConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfiguration.class);

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> registrations,
            PortfolioAuthenticationSuccessHandler successHandler) throws Exception {
        http
                .csrf(csrf -> csrf.ignoringRequestMatchers(
                        "/api/v1/bookings/**",
                        "/api/v1/contact-inquiries",
                        "/api/v1/assistant/**",
                        "/api/v1/blog/posts/*/shares"))
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/v1/bookings/admin/**").authenticated()
                        .requestMatchers("/api/v1/projects/admin/**").authenticated()
                        .requestMatchers("/api/v1/skills/admin/**").authenticated()
                        .requestMatchers("/api/v1/profile/admin").authenticated()
                        .requestMatchers("/api/v1/blog/admin/**").authenticated()
                        .requestMatchers(
                                "/api/v1/health",
                                "/api/v1/bookings/**",
                                "/api/v1/contact-inquiries",
                                "/actuator/health/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/error")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/guestbook/messages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/skills").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/profile").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/blog/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/blog/posts/*/shares").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/reviews/**").authenticated()
                        .requestMatchers("/api/v1/blog/**").authenticated()
                        .requestMatchers("/api/v1/guestbook/**").authenticated()
                        .anyRequest().permitAll())
                .logout(logout -> logout
                        .logoutUrl("/api/v1/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(204)));
        if (registrations.getIfAvailable() != null) {
            http.oauth2Login(oauth -> oauth
                    .successHandler(successHandler)
                    .failureHandler((request, response, exception) -> {
                        logger.warn("OAuth login failed at {}: {} - {}", request.getRequestURI(),
                                exception.getClass().getSimpleName(), exception.getMessage());
                        response.sendRedirect("/login?error");
                    }));
        }
        return http.build();
    }
}
