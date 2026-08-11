package com.omarabusahmoud.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI portfolioOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Omar Abusahmoud Portfolio API")
                        .description("Booking, guestbook, portfolio assistant, and contact APIs.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Omar Abusahmoud")
                                .email("omarcode.business@gmail.com")
                                .url("https://github.com/CodeArmour"))
                        .license(new License()
                                .name("All rights reserved")))
                .addServersItem(new Server()
                        .url("http://localhost:8081")
                        .description("Local development server"))
                .components(new Components());
    }
}
