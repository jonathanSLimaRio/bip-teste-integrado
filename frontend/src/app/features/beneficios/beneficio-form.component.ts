import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Beneficio } from '../../core/models/beneficio';
import { BeneficioService } from '../../core/services/beneficio.service';

@Component({
  standalone: true,
  selector: 'app-beneficio-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="page">
    <header class="page__header">
      <h1>{{ isEdit() ? 'Editar' : 'Novo' }} Benefício</h1>
      <a class="btn" [routerLink]="['/beneficios']">Voltar</a>
    </header>

    <form [formGroup]="form" (ngSubmit)="salvar()" class="form">
      <label>Nome
        <input type="text" formControlName="nome" required maxlength="100">
      </label>

      <label>Descrição
        <input type="text" formControlName="descricao" maxlength="255">
      </label>

      <label>Valor
        <input type="number" step="0.01" formControlName="valor" required>
      </label>

      <label class="check">
        <input type="checkbox" formControlName="ativo"> Ativo
      </label>

      <button class="btn btn--primary" type="submit" [disabled]="form.invalid">Salvar</button>
    </form>
  </section>
  `,
  styles: [`
    .form { display: grid; gap: .75rem; max-width: 480px; }
    .check { display:flex; align-items:center; gap:.5rem; }
  `]
})
export class BeneficioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(BeneficioService);

  id = signal<number | null>(null);
  isEdit = computed(() => this.id() !== null);

  form = this.fb.group({
    nome: this.fb.control<string>('', [Validators.required, Validators.maxLength(100)]),
    descricao: this.fb.control<string | null>('', [Validators.maxLength(255)]),
    valor: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
    ativo: this.fb.control<boolean>(true),
    version: this.fb.control<number | null>(null),
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id.set(+param);
      this.service.get(+param).subscribe({
        next: (b) => this.form.patchValue(b),
        error: (e) => console.error(e)
      });
    }
  }

  salvar() {
    const payload = this.form.getRawValue() as Beneficio;
    if (this.isEdit() && this.id() !== null) {
      this.service.update(this.id()!, payload).subscribe({
        next: () => this.router.navigate(['/beneficios']),
        error: (e) => alert(e?.error?.error || 'Erro ao atualizar')
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => this.router.navigate(['/beneficios']),
        error: (e) => alert(e?.error?.error || 'Erro ao criar')
      });
    }
  }
}
