import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

// DTO для создания пользователя (совпадает с RegisterRequestDto)
export interface CreateUserDto {
  username: string;
  password: string;
  role: string; // "Admin" | "Analyst"
}

// DTO для обновления пользователя
export interface UpdateUserDto {
  username: string;
  role: string;
}

// DTO для смены пароля
export interface ChangePasswordDto {
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`; // Используем AuthController

  // Получить всех пользователей (GET /api/Auth/users)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Создать пользователя (POST /api/Auth/register)
  createUser(dto: CreateUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  // Удалить пользователя (DELETE /api/Auth/users/{id})
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Получить текущего пользователя (GET /api/Auth/me)
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
