package com.example.demo.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record BeneficioDTO(
  Long id,
  @NotBlank @Size(max = 100) String nome,
  @Size(max = 255) String descricao,
  @NotNull BigDecimal valor,
  @NotNull Boolean ativo,
  Long version
) {}
