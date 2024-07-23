import { TestBed } from '@angular/core/testing';
import { AppliedDqChecksService } from './applied-dq-checks.service';


describe('AppliedDqChecksService', () => {
  let service: AppliedDqChecksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppliedDqChecksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
