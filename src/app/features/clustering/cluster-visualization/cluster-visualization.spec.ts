import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterVisualization } from './cluster-visualization';

describe('ClusterVisualization', () => {
  let component: ClusterVisualization;
  let fixture: ComponentFixture<ClusterVisualization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClusterVisualization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClusterVisualization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
