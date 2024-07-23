import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { environment as env } from 'src/environments/environment';

import { apiPaths } from '../../Config/apiPaths';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let httpTestingController: HttpTestingController;
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule, HttpClientTestingModule ],
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should ', () => {
    const url = env.ip+apiPaths.api.root+ apiPaths.api.dataTypes;
    
    const req = httpTestingController.expectOne('http://20.81.21.75:8000/api/dataTypeView');
    expect(req.request.method).toEqual('GET');
    req.flush([]);
  })
});
