package com.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Stateless
public class BeneficioEjbService {

  @PersistenceContext
  private EntityManager em;

  public void transfer(Long fromId, Long toId, BigDecimal amount) {
    if (amount == null || amount.signum() <= 0)
      throw new IllegalArgumentException("Valor inválido");

    // Pessimistic lock para evitar lost update
    Beneficio from = em.find(Beneficio.class, fromId, LockModeType.PESSIMISTIC_WRITE);
    Beneficio to   = em.find(Beneficio.class, toId,   LockModeType.PESSIMISTIC_WRITE);

    if (from == null || to == null) throw new EntityNotFoundException("Conta inexistente");
    if (!Boolean.TRUE.equals(from.getAtivo()) || !Boolean.TRUE.equals(to.getAtivo()))
      throw new IllegalStateException("Benefício inativo");

    if (from.getValor().compareTo(amount) < 0)
      throw new IllegalStateException("Saldo insuficiente");

    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));

    em.merge(from);
    em.merge(to);
  }
}
