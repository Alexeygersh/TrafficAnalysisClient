import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketList } from './packet-list';

describe('PacketList', () => {
  let component: PacketList;
  let fixture: ComponentFixture<PacketList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacketList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
