package com.example.demo.service;

import com.example.demo.domain.Beneficio;
import com.example.demo.repository.BeneficioRepository;
import jakarta.persistence.OptimisticLockException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BeneficioService {

  private final BeneficioRepository repo;

  public BeneficioService(BeneficioRepository repo) {
    this.repo = repo;
  }

  public List<Beneficio> list() { return repo.findAll(); }

  public Beneficio get(Long id) {
    return repo.findById(id).orElseThrow(() -> new NotFoundException("Benefício não encontrado"));
  }

  @Transactional
  public Beneficio create(Beneficio b) { return repo.save(b); }

  @Transactional
  public Beneficio update(Long id, java.util.function.Consumer<Beneficio> changes) {
    var e = get(id);
    changes.accept(e);
    return repo.save(e);
  }

  @Transactional
  public void delete(Long id) { repo.delete(get(id)); }

  /** Transferência com PESSIMISTIC WRITE + validação de saldo */
  @Transactional(rollbackOn = Exception.class)
  public void transfer(Long fromId, Long toId, BigDecimal amount) {
    if (amount == null || amount.signum() <= 0)
      throw new BusinessException("Valor de transferência inválido");

    var from = repo.findForUpdate(fromId).orElseThrow(() -> new NotFoundException("Origem não encontrada"));
    var to   = repo.findForUpdate(toId).orElseThrow(() -> new NotFoundException("Destino não encontrado"));

    if (!Boolean.TRUE.equals(from.getAtivo()) || !Boolean.TRUE.equals(to.getAtivo()))
      throw new BusinessException("Benefício inativo");

    if (from.getValor().compareTo(amount) < 0)
      throw new BusinessException("Saldo insuficiente");

    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    // save acontece no flush/commit; pessimistic lock garante integridade
  }
}
