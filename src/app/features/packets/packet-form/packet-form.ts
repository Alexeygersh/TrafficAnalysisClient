import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { PacketService } from '../../../core/services/packet';
import { CreatePacketDto, UpdatePacketDto, NetworkPacket } from '../../../core/models/network-packet.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';

@Component({
  selector: 'app-packet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './packet-form.html',
  styleUrl: './packet-form.css'
})
export class PacketForm implements OnInit {
  private fb = inject(FormBuilder);
  private packetService = inject(PacketService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  packetForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  packetId: number | null = null;

  protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH'];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.packetForm = this.fb.group({
      sourceIP: ['', [
        Validators.required,
        Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)
      ]],
      destinationIP: ['', [
        Validators.required,
        Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)
      ]],
      port: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(65535)
      ]],
      protocol: ['TCP', Validators.required],
      packetSize: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(65535)
      ]],
      sessionId: [null]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.packetId = +id;
      this.loadPacket(this.packetId);
    }
  }

  loadPacket(id: number): void {
    this.isLoading.set(true);

    this.packetService.getPacketById(id).subscribe({
      next: (packet) => {
        this.packetForm.patchValue({
          sourceIP: packet.sourceIP,
          destinationIP: packet.destinationIP,
          port: packet.port,
          protocol: packet.protocol,
          packetSize: packet.packetSize,
          sessionId: packet.sessionId
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки пакета');
        this.isLoading.set(false);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.packetForm.invalid) {
      this.packetForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formData = this.packetForm.value;

    try {
      if (this.isEditMode() && this.packetId) {
        // Режим редактирования
        const updateDto: UpdatePacketDto = formData;

        this.packetService.updatePacket(this.packetId, updateDto).subscribe({
          next: async () => {
            try {
              await this.router.navigate(['/packets', this.packetId]);
            } catch (error) {
              console.error('Navigation error:', error);
              this.errorMessage.set('Ошибка навигации после обновления');
            } finally {
              this.isSaving.set(false);
            }
          },
          error: (error) => {
            this.errorMessage.set(error.message || 'Ошибка обновления пакета');
            this.isSaving.set(false);
          }
        });
      } else {
        // Режим создания
        const createDto: CreatePacketDto = formData;

        this.packetService.createPacket(createDto).subscribe({
          next: async (packet) => {
            try {
              await this.router.navigate(['/packets', packet.id]);
            } catch (error) {
              console.error('Navigation error:', error);
              this.errorMessage.set('Ошибка навигации после создания');
            } finally {
              this.isSaving.set(false);
            }
          },
          error: (error) => {
            this.errorMessage.set(error.message || 'Ошибка создания пакета');
            this.isSaving.set(false);
          }
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      this.errorMessage.set('Неожиданная ошибка');
      this.isSaving.set(false);
    }
  }

  async cancel(): Promise<void> {
    try {
      if (this.isEditMode() && this.packetId) {
        await this.router.navigate(['/packets', this.packetId]);
      } else {
        await this.router.navigate(['/packets']);
      }
    } catch (error) {
      console.error('Navigation error during cancel:', error);
      // Fallback navigation
      this.router.navigate(['/packets']).catch(err =>
        console.error('Fallback navigation also failed:', err)
      );
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.packetForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }
    if (field?.hasError('pattern')) {
      return 'Неверный формат IP-адреса (например: 192.168.1.1)';
    }
    if (field?.hasError('min')) {
      return `Минимальное значение: ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `Максимальное значение: ${field.errors?.['max'].max}`;
    }
    return '';
  }
}
