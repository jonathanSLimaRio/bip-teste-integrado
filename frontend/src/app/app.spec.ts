import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';

describe('App', () => {
  it('should create and render router-outlet', async () => {
    await TestBed.configureTestingModule({
      imports: [App], // standalone
      providers: [
        // Não vamos iniciar o Router automaticamente
        provideRouter([], withDisabledInitialNavigation()),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    // valida o que de fato existe no template do App
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
