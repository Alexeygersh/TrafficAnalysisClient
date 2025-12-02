import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService, CreateUserDto } from '../../../../core/services/user';

export interface UserFormData {
  mode: 'create';
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserForm>);

  userForm!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  roles = [
    { value: 'Admin', label: 'Администратор' },
    { value: 'Analyst', label: 'Аналитик' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserFormData) {
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      role: ['Analyst', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dto: CreateUserDto = this.userForm.value;

    this.userService.createUser(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.dialogRef.close(true); // Закрыть диалог с результатом
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Ошибка создания пользователя');
        console.error('Error creating user:', error);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  // Получение ошибок валидации для отображения
  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Минимум ${minLength} символов`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Максимум ${maxLength} символов`;
    }
    return '';
  }

  get dialogTitle(): string {
    return 'Создать пользователя';
  }

  get submitButtonText(): string {
    return 'Создать';
  }
}
