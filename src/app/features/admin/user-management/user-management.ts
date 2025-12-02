import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserList } from './user-list/user-list';
import { UserForm } from './user-form/user-form';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    UserList
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  users = signal<User[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки пользователей');
        this.isLoading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserForm, {
      width: '500px',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Перезагрузить список после создания
      }
    });
  }

  onUserDeleted(): void {
    this.loadUsers(); // Перезагрузить список после удаления
  }

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }
}
