import { Routes } from '@angular/router';
import { BeneficiosListComponent } from './features/beneficios/beneficios-list.component';
import { BeneficioFormComponent } from './features/beneficios/beneficio-form.component';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'beneficios', pathMatch: 'full' },
    { path: 'beneficios', component: BeneficiosListComponent, title: 'Benefícios' },
    { path: 'beneficios/novo', component: BeneficioFormComponent, title: 'Novo Benefício' },
    { path: 'beneficios/:id/editar', component: BeneficioFormComponent, title: 'Editar Benefício' },
    { path: '**', redirectTo: 'beneficios' }
];
