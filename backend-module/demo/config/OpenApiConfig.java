package com.example.demo.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI().info(new Info()
      .title("API Benefícios")
      .description("Documentação do backend Spring Boot para o desafio Fullstack Integrado")
      .version("1.0.0"));
  }
}
