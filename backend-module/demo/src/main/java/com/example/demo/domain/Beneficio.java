package com.example.demo.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.*;

@Getter @Setter
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "beneficio")
public class Beneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nome;

    @Size(max = 255)
    private String descricao;

    @NotNull
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal valor;

    @NotNull
    private Boolean ativo = true;

    @Version
    private Long version;

    // getters/setters
    // equals/hashCode por id
}
