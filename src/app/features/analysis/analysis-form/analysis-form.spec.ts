import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisForm } from './analysis-form';

describe('AnalysisForm', () => {
  let component: AnalysisForm;
  let fixture: ComponentFixture<AnalysisForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
