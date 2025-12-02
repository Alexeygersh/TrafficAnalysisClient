import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlScoreIndicator } from './ml-score-indicator';

describe('MlScoreIndicator', () => {
  let component: MlScoreIndicator;
  let fixture: ComponentFixture<MlScoreIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlScoreIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlScoreIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
