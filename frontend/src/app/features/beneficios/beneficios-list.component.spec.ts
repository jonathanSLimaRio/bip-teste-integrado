import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BeneficiosListComponent } from './beneficios-list.component';
import { BeneficioService } from '../../core/services/beneficio.service';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';

describe('BeneficiosListComponent', () => {
    let fixture: any;
    let comp: BeneficiosListComponent;

    const serviceMock = {
        list: jest.fn(),
        delete: jest.fn(),
        transfer: jest.fn(),
    } as unknown as jest.Mocked<BeneficioService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BeneficiosListComponent],
            providers: [
                { provide: BeneficioService, useValue: serviceMock },
                // evita tentativa de navegar no boot
                provideRouter([], withDisabledInitialNavigation()),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BeneficiosListComponent);
        comp = fixture.componentInstance;
    });

    it('deve renderizar tabela com dados', () => {
        (serviceMock.list as any).mockReturnValue(of([
            { id: 1, nome: 'Auxílio', valor: 123.45, ativo: true }
        ]));
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(comp.beneficios().length).toBe(1);
        expect(el.querySelector('table')).toBeTruthy();
        expect(el.textContent).toContain('Auxílio');
    });

    it('deve exibir estado de erro ao falhar', () => {
        // opcional: não poluir o console
        jest.spyOn(console, 'error').mockImplementation(() => { });

        (serviceMock.list as any).mockReturnValue(
            throwError(() => ({ error: { error: 'Falha' } }))
        );
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(comp.error()).toBe('Falha');
        expect(el.textContent).toContain('Não foi possível carregar os benefícios');
    });
});
