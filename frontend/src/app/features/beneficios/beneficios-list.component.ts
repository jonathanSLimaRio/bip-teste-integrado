import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Beneficio } from '../../core/models/beneficio';
import { FormsModule } from '@angular/forms';
import { BeneficioService } from '../../core/services/beneficio.service';

@Component({
    standalone: true,
    selector: 'app-beneficios-list',
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
  <section class="page">
    <header class="page__header">
      <h1>Benefícios</h1>
      <a class="btn btn--primary" [routerLink]="['/beneficios/novo']">Novo</a>
    </header>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Nome</th><th>Valor</th><th>Ativo</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let b of beneficios()">
          <td>{{ b.id }}</td>
          <td>{{ b.nome }}</td>
          <td>R$ {{ b.valor | number:'1.2-2' }}</td>
          <td>{{ b.ativo ? 'Sim' : 'Não' }}</td>
          <td class="actions">
            <a [routerLink]="['/beneficios', b.id, 'editar']">Editar</a>
            <button (click)="remover(b)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <fieldset class="transfer">
      <legend>Transferência</legend>
      <form (ngSubmit)="transferir()">
        <input type="number" placeholder="De (ID)" [(ngModel)]="fromId" name="fromId" required>
        <input type="number" placeholder="Para (ID)" [(ngModel)]="toId"   name="toId" required>
        <input type="number" step="0.01" placeholder="Valor" [(ngModel)]="amount" name="amount" required>
        <button type="submit">Transferir</button>
      </form>
      <p class="hint">Erros aparecerão no console; trate com UI conforme necessário.</p>
    </fieldset>
  </section>
  `,
    styleUrls: ['./beneficios.scss']
})
export class BeneficiosListComponent implements OnInit {
    private service = inject(BeneficioService);
    private router = inject(Router);

    beneficios = signal<Beneficio[]>([]);
    fromId?: number;
    toId?: number;
    amount?: number;

    ngOnInit(): void {
        this.load();
    }

    load() {
        this.service.list().subscribe({
            next: (res) => this.beneficios.set(res),
            error: (err) => console.error(err)
        });
    }

    remover(b: Beneficio) {
        if (!b.id) return;
        if (!confirm(`Excluir ${b.nome}?`)) return;
        this.service.delete(b.id).subscribe({
            next: () => this.load(),
            error: (err) => console.error(err)
        });
    }

    transferir() {
        if (!this.fromId || !this.toId || !this.amount) return;
        this.service.transfer(this.fromId, this.toId, this.amount).subscribe({
            next: () => this.load(),
            error: (err) => {
                console.error(err);
                alert(err?.error?.error || 'Erro na transferência');
            }
        });
    }
}
