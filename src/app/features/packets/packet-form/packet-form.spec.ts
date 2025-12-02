import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketForm } from './packet-form';

describe('PacketForm', () => {
  let component: PacketForm;
  let fixture: ComponentFixture<PacketForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacketForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
