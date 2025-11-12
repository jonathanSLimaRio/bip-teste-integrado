package com.example.demo.service;

import com.example.demo.domain.Beneficio;
import com.example.demo.repository.BeneficioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficioServiceTest {

    @Mock
    private BeneficioRepository repo;

    @InjectMocks
    private BeneficioService service;

    private Beneficio ativo(BigDecimal valor, Long id) {
        Beneficio b = new Beneficio();
        b.setId(id);
        b.setAtivo(true);
        b.setValor(valor);
        return b;
    }

    private Beneficio inativo(BigDecimal valor, Long id) {
        Beneficio b = new Beneficio();
        b.setId(id);
        b.setAtivo(false);
        b.setValor(valor);
        return b;
    }

    @BeforeEach
    void setup() {
        // nada específico aqui, apenas deixando explícito
    }

    @Test
    void list_deveRetornarTodos() {
        var a = ativo(new BigDecimal("10.00"), 1L);
        var b = ativo(new BigDecimal("20.00"), 2L);
        when(repo.findAll()).thenReturn(List.of(a, b));

        var result = service.list();

        assertEquals(2, result.size());
        verify(repo).findAll();
    }

    @Test
    void get_quandoExiste_deveRetornar() {
        var a = ativo(new BigDecimal("10.00"), 1L);
        when(repo.findById(1L)).thenReturn(Optional.of(a));

        var result = service.get(1L);

        assertSame(a, result);
        verify(repo).findById(1L);
    }

    @Test
    void get_quandoNaoExiste_deveLancarNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        var ex = assertThrows(NotFoundException.class, () -> service.get(99L));
        assertTrue(ex.getMessage().toLowerCase().contains("não encontrado"));
        verify(repo).findById(99L);
    }

    @Test
    void create_deveSalvar() {
        var novo = ativo(new BigDecimal("100.00"), null);
        var salvo = ativo(new BigDecimal("100.00"), 10L);
        when(repo.save(novo)).thenReturn(salvo);

        var result = service.create(novo);

        assertEquals(10L, result.getId());
        verify(repo).save(novo);
    }

    @Test
    void update_deveAplicarChangesESalvar() {
        var existente = ativo(new BigDecimal("50.00"), 5L);
        when(repo.findById(5L)).thenReturn(Optional.of(existente));
        when(repo.save(existente)).thenAnswer(inv -> inv.getArgument(0));

        Consumer<Beneficio> changes = b -> b.setValor(new BigDecimal("123.45"));

        var result = service.update(5L, changes);

        assertEquals(new BigDecimal("123.45"), result.getValor());
        verify(repo).findById(5L);
        verify(repo).save(existente);
    }

    @Test
    void delete_deveBuscarEApagar() {
        var existente = ativo(new BigDecimal("10.00"), 7L);
        when(repo.findById(7L)).thenReturn(Optional.of(existente));

        service.delete(7L);

        verify(repo).delete(existente);
    }

    // ---------- transfer() ----------

    @Test
    void transfer_sucesso_deveDebitarEConsultarComLock() {
        var from = ativo(new BigDecimal("100.00"), 1L);
        var to = ativo(new BigDecimal("50.00"), 2L);

        when(repo.findForUpdate(1L)).thenReturn(Optional.of(from));
        when(repo.findForUpdate(2L)).thenReturn(Optional.of(to));

        service.transfer(1L, 2L, new BigDecimal("30.00"));

        assertEquals(new BigDecimal("70.00"), from.getValor());
        assertEquals(new BigDecimal("80.00"), to.getValor());
        // save não é obrigatório na transferência (flush no commit), apenas garantir
        // chamadas
        verify(repo).findForUpdate(1L);
        verify(repo).findForUpdate(2L);
        verifyNoMoreInteractions(repo);
    }

    @Test
    void transfer_quandoValorNulo_ouNaoPositivo_deveLancarBusiness() {
        var ex1 = assertThrows(BusinessException.class, () -> service.transfer(1L, 2L, null));
        var ex2 = assertThrows(BusinessException.class, () -> service.transfer(1L, 2L, BigDecimal.ZERO));
        var ex3 = assertThrows(BusinessException.class, () -> service.transfer(1L, 2L, new BigDecimal("-1")));

        assertTrue(ex1.getMessage().toLowerCase().contains("inválido"));
        assertTrue(ex2.getMessage().toLowerCase().contains("inválido"));
        assertTrue(ex3.getMessage().toLowerCase().contains("inválido"));
        verifyNoInteractions(repo);
    }

    @Test
    void transfer_quandoOrigemNaoEncontrada_deveLancarNotFound() {
        when(repo.findForUpdate(1L)).thenReturn(Optional.empty());

        var ex = assertThrows(NotFoundException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertTrue(ex.getMessage().toLowerCase().contains("origem"));
        verify(repo).findForUpdate(1L);
        verifyNoMoreInteractions(repo);
    }

    @Test
    void transfer_quandoDestinoNaoEncontrado_deveLancarNotFound() {
        var from = ativo(new BigDecimal("100.00"), 1L);
        when(repo.findForUpdate(1L)).thenReturn(Optional.of(from));
        when(repo.findForUpdate(2L)).thenReturn(Optional.empty());

        var ex = assertThrows(NotFoundException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertTrue(ex.getMessage().toLowerCase().contains("destino"));
        verify(repo).findForUpdate(1L);
        verify(repo).findForUpdate(2L);
        verifyNoMoreInteractions(repo);
    }

    @Test
    void transfer_quandoAlgumInativo_deveLancarBusiness() {
        var from = inativo(new BigDecimal("100.00"), 1L);
        var to = ativo(new BigDecimal("50.00"), 2L);

        when(repo.findForUpdate(1L)).thenReturn(Optional.of(from));
        when(repo.findForUpdate(2L)).thenReturn(Optional.of(to));

        var ex = assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertTrue(ex.getMessage().toLowerCase().contains("inativo"));
    }

    @Test
    void transfer_quandoSaldoInsuficiente_deveLancarBusiness() {
        var from = ativo(new BigDecimal("5.00"), 1L);
        var to = ativo(new BigDecimal("50.00"), 2L);

        when(repo.findForUpdate(1L)).thenReturn(Optional.of(from));
        when(repo.findForUpdate(2L)).thenReturn(Optional.of(to));

        var ex = assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertTrue(ex.getMessage().toLowerCase().contains("saldo"));
    }
}
