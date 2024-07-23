import { TestBed } from '@angular/core/testing';

import { ProjectViewActiveTabService } from './project-view-active-tab.service';

describe('ProjectViewActiveTabService', () => {
  let service: ProjectViewActiveTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectViewActiveTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
