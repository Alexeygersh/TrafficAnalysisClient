import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusteringDashboard } from './clustering-dashboard';

describe('ClusteringDashboard', () => {
  let component: ClusteringDashboard;
  let fixture: ComponentFixture<ClusteringDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClusteringDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClusteringDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
