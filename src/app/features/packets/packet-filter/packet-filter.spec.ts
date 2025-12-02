import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFilter } from './packet-filter';

describe('PacketFilter', () => {
  let component: PacketFilter;
  let fixture: ComponentFixture<PacketFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacketFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
