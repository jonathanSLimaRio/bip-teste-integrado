package com.example.demo.service.ejb;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class BeneficioEjbClientStub implements BeneficioEjbClient {
  @Override
  public void transfer(Long fromId, Long toId, BigDecimal amount) {
    System.out.printf("Simulando chamada EJB: transfer(%d -> %d, %s)%n", fromId, toId, amount);
  }
}
