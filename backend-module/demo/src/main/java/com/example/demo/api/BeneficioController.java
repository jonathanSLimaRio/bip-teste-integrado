package com.example.demo.api;

import com.example.demo.api.dto.BeneficioDTO;
import com.example.demo.api.mapper.BeneficioMapper;
import com.example.demo.domain.Beneficio;
import com.example.demo.service.BeneficioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/beneficios")
public class BeneficioController {

  private final BeneficioService service;

  public BeneficioController(BeneficioService service) { this.service = service; }

  @GetMapping public List<BeneficioDTO> list() {
    return service.list().stream().map(BeneficioMapper::toDTO).toList();
  }

  @GetMapping("/{id}") public BeneficioDTO get(@PathVariable Long id) {
    return BeneficioMapper.toDTO(service.get(id));
  }

  @PostMapping public BeneficioDTO create(@Valid @RequestBody BeneficioDTO dto) {
    var e = new Beneficio();
    BeneficioMapper.updateEntity(e, dto);
    return BeneficioMapper.toDTO(service.create(e));
  }

  @PutMapping("/{id}") public BeneficioDTO update(@PathVariable Long id, @Valid @RequestBody BeneficioDTO dto) {
    var e = service.update(id, ent -> BeneficioMapper.updateEntity(ent, dto));
    return BeneficioMapper.toDTO(e);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { service.delete(id); }

  /** transferência */
  public record TransferRequest(Long fromId, Long toId, BigDecimal amount) {}
  @PostMapping("/transfer")
  public void transfer(@RequestBody TransferRequest r) { service.transfer(r.fromId(), r.toId(), r.amount()); }
}
