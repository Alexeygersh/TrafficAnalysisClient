import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef, MAT_DIALOG_DATA, MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

interface EditDialogData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-edit-pcap-file-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align: middle">edit</mat-icon>
      &nbsp;Редактировать файл PCAP
    </h2>

    <mat-dialog-content style="display:flex; flex-direction:column; gap:8px; padding-top:8px;">
      <mat-form-field appearance="outline">
        <mat-label>Имя файла</mat-label>
        <input matInput [(ngModel)]="data.name" maxlength="100" required>
        <mat-hint align="end">{{ data.name.length }}/100</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Описание</mat-label>
        <textarea matInput [(ngModel)]="data.description"
                  rows="3" maxlength="200"></textarea>
        <mat-hint align="end">{{ (data.description || '').length }}/200</mat-hint>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Отмена</button>
      <button mat-raised-button color="primary"
              (click)="save()"
              [disabled]="!data.name.trim()">
        Сохранить
      </button>
    </mat-dialog-actions>
  `,
})
export class EditPcapFileDialog {
  data = inject<EditDialogData>(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef<EditPcapFileDialog>);

  cancel(): void { this.ref.close(); }
  save(): void {
    this.ref.close({
      name: this.data.name.trim(),
      description: this.data.description?.trim() || '',
    });
  }
}
