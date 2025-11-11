package com.example.ejb;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "beneficio")
public class Beneficio {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String nome;
  private String descricao;

  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal valor;

  private Boolean ativo = true;

  @Version
  private Long version;

  // getters/setters
}
