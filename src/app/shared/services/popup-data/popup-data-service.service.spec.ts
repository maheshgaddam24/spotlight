import { TestBed } from '@angular/core/testing';

import { PopupDataService } from './popup-data-service.service';

describe('PopupDataServiceService', () => {
  let service: PopupDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
