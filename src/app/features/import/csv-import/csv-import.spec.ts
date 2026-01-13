import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvImport } from './csv-import';

describe('CsvImport', () => {
  let component: CsvImport;
  let fixture: ComponentFixture<CsvImport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvImport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvImport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
