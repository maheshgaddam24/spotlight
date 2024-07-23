import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { LoaderService } from './loader.service';



describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
    });
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
