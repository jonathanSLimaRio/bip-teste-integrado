import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BeneficioService } from './beneficio.service';
import { environment } from '../../../environments/environment';

describe('BeneficioService', () => {
    let service: BeneficioService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BeneficioService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(BeneficioService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('list deve buscar benefícios', () => {
        const mock = [{ id: 1, nome: 'Vale', valor: 10, ativo: true }];
        service.list().subscribe(res => {
            expect(res.length).toBe(1);
            expect(res[0].nome).toBe('Vale');
        });
        const req = httpMock.expectOne(`${environment.apiUrl}/beneficios`);
        expect(req.request.method).toBe('GET');
        req.flush(mock);
    });

    it('transfer deve postar payload correto', () => {
        service.transfer(1, 2, 100).subscribe();
        const req = httpMock.expectOne(`${environment.apiUrl}/beneficios/transfer`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ fromId: 1, toId: 2, amount: 100 });
        req.flush({});
    });
});