import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Текущая тема
  isDarkTheme = signal(true);

  constructor() {
    // Загружаем сохранённую тему из localStorage
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme) {
        this.isDarkTheme.set(savedTheme === 'dark');
      } else {
        // Проверяем системные предпочтения
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme.set(prefersDark);
      }

      this.applyTheme();
    }

    // Автоматическое применение темы при изменении
    effect(() => {
      this.applyTheme();
      this.saveTheme();
    });
  }

  // Переключить тему
  toggleTheme(): void {
    this.isDarkTheme.update(value => !value);
  }

  // Установить конкретную тему
  setTheme(isDark: boolean): void {
    this.isDarkTheme.set(isDark);
  }

  // Применить тему к html
  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const htmlElement = document.documentElement;
    const isDark = this.isDarkTheme();

    // Полностью заменяем классы
    htmlElement.classList.remove('dark-theme', 'light-theme');
    htmlElement.classList.add(isDark ? 'dark-theme' : 'light-theme');

    // Также добавляем атрибут для дополнительной гибкости
    htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  // Сохранить тему в localStorage
  private saveTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('theme', this.isDarkTheme() ? 'dark' : 'light');
  }
}
