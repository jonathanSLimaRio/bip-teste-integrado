import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Beneficio } from '../models/beneficio';

@Injectable({ providedIn: 'root' })
export class BeneficioService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/beneficios`;

    list(): Observable<Beneficio[]> {
        return this.http.get<Beneficio[]>(this.base);
    }

    get(id: number): Observable<Beneficio> {
        return this.http.get<Beneficio>(`${this.base}/${id}`);
    }

    create(data: Beneficio): Observable<Beneficio> {
        return this.http.post<Beneficio>(this.base, data);
    }

    update(id: number, data: Beneficio): Observable<Beneficio> {
        return this.http.put<Beneficio>(`${this.base}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    transfer(fromId: number, toId: number, amount: number): Observable<void> {
        return this.http.post<void>(`${this.base}/transfer`, { fromId, toId, amount });
    }
}
