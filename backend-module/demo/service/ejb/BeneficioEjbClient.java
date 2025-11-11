package com.example.demo.service.ejb;

import java.math.BigDecimal;

public interface BeneficioEjbClient {
  void transfer(Long fromId, Long toId, BigDecimal amount);
}
