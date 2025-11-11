package com.example.demo.api.mapper;

import com.example.demo.api.dto.BeneficioDTO;
import com.example.demo.domain.Beneficio;

public class BeneficioMapper {

  public static BeneficioDTO toDTO(Beneficio e) {
    return new BeneficioDTO(
      e.getId(), e.getNome(), e.getDescricao(), e.getValor(), e.getAtivo(), e.getVersion()
    );
  }

  public static void updateEntity(Beneficio e, BeneficioDTO d) {
    e.setNome(d.nome());
    e.setDescricao(d.descricao());
    e.setValor(d.valor());
    e.setAtivo(d.ativo());
    // version é controlada pelo JPA
  }
}
