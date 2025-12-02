import { TestBed } from '@angular/core/testing';

import { PacketService } from './packet';

describe('Packet', () => {
  let service: PacketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
