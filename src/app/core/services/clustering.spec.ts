import { TestBed } from '@angular/core/testing';

import { Clustering } from './clustering';

describe('Clustering', () => {
  let service: Clustering;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clustering);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
