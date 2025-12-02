import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketCard } from './packet-card';

describe('PacketCard', () => {
  let component: PacketCard;
  let fixture: ComponentFixture<PacketCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacketCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
