import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PacketService } from '../../../core/services/packet';
import { AuthService } from '../../../core/services/auth';
import { NetworkPacket, ThreatScore } from '../../../core/models/network-packet.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';

@Component({
  selector: 'app-packet-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './packet-detail.html',
  styleUrl: './packet-detail.css'
})
export class PacketDetail implements OnInit {
  private packetService = inject(PacketService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  packet = signal<NetworkPacket | null>(null);
  threatScore = signal<ThreatScore | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPacket(+id);
      this.loadThreatScore(+id);
    }
  }

  loadPacket(id: number): void {
    this.packetService.getPacketById(id).subscribe({
      next: (packet) => {
        this.packet.set(packet);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки пакета');
        this.isLoading.set(false);
      }
    });
  }

  loadThreatScore(id: number): void {
    this.packetService.getThreatScore(id).subscribe({
      next: (score) => {
        this.threatScore.set(score);
      },
      error: (error) => {
        console.error('Ошибка загрузки балла угрозы:', error);
      }
    });
  }

  async deletePacket(): Promise<void> {
    const packet = this.packet();
    if (!packet) return;

    if (!confirm(`Вы уверены, что хотите удалить пакет #${packet.id}?`)) {
      return;
    }

    this.packetService.deletePacket(packet.id).subscribe({
      next: async () => {
        try {
          await this.router.navigate(['/packets']);
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback navigation or error handling
          this.router.navigate(['/packets']).catch(err =>
            console.error('Fallback navigation also failed:', err)
          );
        }
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
