import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketDetail } from './packet-detail';

describe('PacketDetail', () => {
  let component: PacketDetail;
  let fixture: ComponentFixture<PacketDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacketDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
