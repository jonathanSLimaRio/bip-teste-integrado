import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Beneficio } from '../../core/models/beneficio';
import { BeneficioService } from '../../core/services/beneficio.service';

@Component({
  standalone: true,
  selector: 'app-beneficios-list',
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  template: `
  <section class="page container">
    <header class="page__header">
      <div class="title">
        <h1>Benefícios</h1>
        <p class="subtitle">Gerencie itens e realize transferências com segurança.</p>
      </div>
      <a class="btn btn--primary" [routerLink]="['/beneficios/novo']">Novo</a>
    </header>

    <div class="card">
      <ng-container *ngIf="isLoading(); else content">
        <div class="skeleton-table" aria-busy="true" aria-label="Carregando lista..."></div>
      </ng-container>

      <ng-template #content>
        <ng-container *ngIf="error(); else tableTpl">
          <div class="state state--error">
            <h3>Não foi possível carregar os benefícios</h3>
            <p>{{ error() }}</p>
            <button class="btn" (click)="load()">Tentar novamente</button>
          </div>
        </ng-container>

        <ng-template #tableTpl>
          <ng-container *ngIf="beneficios().length; else emptyTpl">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th><th>Nome</th><th>Valor</th><th>Status</th><th class="right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of beneficios()">
                  <td>{{ b.id }}</td>
                  <td class="name">
                    <div class="name__title">{{ b.nome }}</div>
                    <div class="name__desc" *ngIf="b.descricao">{{ b.descricao }}</div>
                  </td>
                  <td>{{ b.valor | currency:'BRL':'symbol-narrow':'1.2-2' }}</td>
                  <td>
                    <span class="badge" [class.badge--success]="b.ativo" [class.badge--muted]="!b.ativo">
                      {{ b.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="right actions">
                    <a class="btn btn--ghost" [routerLink]="['/beneficios', b.id, 'editar']">Editar</a>
                    <button class="btn btn--danger" (click)="remover(b)">Excluir</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </ng-container>
          <ng-template #emptyTpl>
            <div class="state state--empty">
              <h3>Nenhum benefício cadastrado</h3>
              <p>Comece criando o primeiro item.</p>
              <a class="btn btn--primary" [routerLink]="['/beneficios/novo']">Criar benefício</a>
            </div>
          </ng-template>
        </ng-template>
      </ng-template>
    </div>

    <div class="card">
      <fieldset class="transfer">
        <legend>Transferência</legend>
        <form (ngSubmit)="transferir()">
          <input type="number" placeholder="De (ID)" [(ngModel)]="fromId" name="fromId" required>
          <input type="number" placeholder="Para (ID)" [(ngModel)]="toId"   name="toId" required>
          <input type="number" step="0.01" placeholder="Valor" [(ngModel)]="amount" name="amount" required>
          <button class="btn" type="submit">Transferir</button>
        </form>
        <p class="hint">Erros aparecerão no console; implemente validação conforme necessário.</p>
      </fieldset>
    </div>
  </section>
  `,
  styleUrls: ['./beneficios.scss']
})
export class BeneficiosListComponent implements OnInit {
  private service = inject(BeneficioService);

  beneficios = signal<Beneficio[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  fromId?: number;
  toId?: number;
  amount?: number;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: (res) => {
        this.beneficios.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.error ?? 'Falha ao buscar dados');
        this.isLoading.set(false);
      }
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