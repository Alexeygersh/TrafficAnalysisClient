import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { SessionService } from '../../../core/services/session';
import { CreateSessionDto, TrafficSession } from '../../../core/models/traffic-session.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './session-form.html',
  styleUrl: './session-form.css'
})
export class SessionForm implements OnInit {
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sessionForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  sessionId: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.sessionForm = this.fb.group({
      sessionName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.sessionId = +id;
      this.loadSession(this.sessionId);
    }
  }

  loadSession(id: number): void {
    this.isLoading.set(true);

    this.sessionService.getSessionById(id).subscribe({
      next: (session) => {
        this.sessionForm.patchValue({
          sessionName: session.sessionName,
          description: session.description
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки сессии');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formData: CreateSessionDto = this.sessionForm.value;

    if (this.isEditMode() && this.sessionId) {
      // Режим редактирования
      this.sessionService.updateSession(this.sessionId, formData).subscribe({
        next: () => {
          this.router.navigate(['/sessions', this.sessionId]);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Ошибка обновления сессии');
          this.isSaving.set(false);
        }
      });
    } else {
      // Режим создания
      this.sessionService.createSession(formData).subscribe({
        next: (session) => {
          this.router.navigate(['/sessions', session.id]);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Ошибка создания сессии');
          this.isSaving.set(false);
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode() && this.sessionId) {
      this.router.navigate(['/sessions', this.sessionId]);
    } else {
      this.router.navigate(['/sessions']);
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Минимум ${minLength} символов`;
    }
    return '';
  }
}
