import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  private userService = inject(UserService);

  @Input() users: User[] = [];
  @Input() currentUserId: number = 0;

  @Output() deleteUser = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'username', 'role', 'createdAt', 'actions'];

  onDelete(user: User): void {
    if (user.id === this.currentUserId) {
      alert('Вы не можете удалить свою учетную запись!');
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.username}"?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.deleteUser.emit(user.id);
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message || 'Неизвестная ошибка'}`);
      }
    });
  }

  getRoleClass(role: string): string {
    return role === 'Admin' ? 'role-admin' : 'role-analyst';
  }

  getRoleIcon(role: string): string {
    return role === 'Admin' ? 'admin_panel_settings' : 'person';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isCurrentUser(userId: number): boolean {
    return userId === this.currentUserId;
  }
}
