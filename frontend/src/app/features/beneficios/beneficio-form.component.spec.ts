import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { BeneficioFormComponent } from './beneficio-form.component';
import { BeneficioService } from '../../core/services/beneficio.service';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '' })
class DummyBeneficiosPage { }

describe('BeneficioFormComponent', () => {
    let fixture: any;
    let comp: BeneficioFormComponent;

    const serviceMock = {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    } as unknown as jest.Mocked<BeneficioService>;

    async function buildWithParam(id: string | null) {
        await TestBed.configureTestingModule({
            imports: [BeneficioFormComponent, DummyBeneficiosPage],
            providers: [
                { provide: BeneficioService, useValue: serviceMock },
                // registra a rota usada no navigate(['/beneficios']) e desabilita a inicial
                provideRouter([{ path: 'beneficios', component: DummyBeneficiosPage }], withDisabledInitialNavigation()),
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map(id ? [['id', id]] : []) } } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BeneficioFormComponent);
        comp = fixture.componentInstance;

        // evita navegação real durante o teste
        const router = TestBed.inject(Router);
        jest.spyOn(router, 'navigate').mockResolvedValue(true as any);
    }

    it('modo criar quando sem id', async () => {
        await buildWithParam(null);
        fixture.detectChanges();

        expect(comp.isEdit()).toBe(false);
        comp.form.patchValue({ nome: 'Novo', valor: 10, ativo: true });
        (serviceMock.create as any).mockReturnValue(of({ id: 9, nome: 'Novo', valor: 10, ativo: true }));

        comp.salvar();
        expect(serviceMock.create).toHaveBeenCalled();
    });

    it('modo editar quando possui id', async () => {
        (serviceMock.get as any).mockReturnValue(of({ id: 5, nome: 'X', valor: 20, ativo: true }));
        await buildWithParam('5');
        fixture.detectChanges();

        expect(comp.isEdit()).toBe(true);
        (serviceMock.update as any).mockReturnValue(of({}));

        comp.salvar();
        expect(serviceMock.update).toHaveBeenCalledWith(5, expect.objectContaining({ nome: 'X' }));
    });
});
