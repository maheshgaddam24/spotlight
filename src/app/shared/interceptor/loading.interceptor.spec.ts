import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { LoadingInterceptor } from './loading.interceptor';

describe('LoadingInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      providers: [LoadingInterceptor],
    })
  );

  it('should be created', () => {
    const interceptor: LoadingInterceptor = TestBed.inject(LoadingInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
