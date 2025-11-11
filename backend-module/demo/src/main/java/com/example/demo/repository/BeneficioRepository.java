package com.example.demo.repository;

import com.example.demo.domain.Beneficio;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface BeneficioRepository extends JpaRepository<Beneficio, Long> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select b from Beneficio b where b.id = :id")
  Optional<Beneficio> findForUpdate(@Param("id") Long id);
}
