import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';

import { NetworkPacket } from '../../../core/models/network-packet.model';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-packet-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDivider
  ],
  templateUrl: './packet-card.html',
  styleUrl: './packet-card.css'
})
export class PacketCard {
  @Input({ required: true }) packet!: NetworkPacket;
  @Output() delete = new EventEmitter<number>();

  authService = inject(AuthService);

  onDelete(): void {
    this.delete.emit(this.packet.id);
  }

  getThreatClass(threatLevel?: string): string {
    switch (threatLevel?.toLowerCase()) {
      case 'critical': return 'threat-critical';
      case 'high': return 'threat-high';
      case 'medium': return 'threat-medium';
      case 'low': return 'threat-low';
      default: return 'threat-none';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}