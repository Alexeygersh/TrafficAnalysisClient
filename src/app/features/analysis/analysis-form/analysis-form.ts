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
import { MatSliderModule } from '@angular/material/slider';

import { AnalysisService } from '../../../core/services/analysis';
import { CreateAnalysisDto } from '../../../core/models/traffic-analysis.model';

@Component({
  selector: 'app-analysis-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSliderModule
  ],
  templateUrl: './analysis-form.html',
  styleUrl: './analysis-form.css'
})
export class AnalysisForm implements OnInit {
  private fb = inject(FormBuilder);
  private analysisService = inject(AnalysisService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  analysisForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  suggestedPacketId = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.checkQueryParams();
  }

  initForm(): void {
    this.analysisForm = this.fb.group({
      packetId: ['', [Validators.required, Validators.min(1)]],
      mlModelScore: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]],
      description: ['']
    });
  }

  checkQueryParams(): void {
    const packetId = this.route.snapshot.queryParamMap.get('packetId');
    if (packetId) {
      this.suggestedPacketId.set(+packetId);
      this.analysisForm.patchValue({ packetId: +packetId });
    }
  }

  onSubmit(): void {
    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formData: CreateAnalysisDto = this.analysisForm.value;

    this.analysisService.createAnalysis(formData).subscribe({
      next: (analysis) => {
        this.router.navigate(['/analysis', analysis.id]);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка создания анализа');
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/analysis']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.analysisForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }
    if (field?.hasError('min')) {
      return `Минимальное значение: ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `Максимальное значение: ${field.errors?.['max'].max}`;
    }
    return '';
  }

  formatMLScore(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
  }

  get mlScoreValue(): number {
    return this.analysisForm.get('mlModelScore')?.value || 0;
  }
}
