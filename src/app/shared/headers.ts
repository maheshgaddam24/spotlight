import { HttpHeaders } from '@angular/common/http';

export const syncDatabase = new HttpHeaders({
  'Content-Type': 'application/json',
  Authorization: 'Basic YWRtaW46YWRtaW4=',
});
export const syncDataInjectionHeaders = new HttpHeaders({
  'Content-Type': 'application/json',
  Authorization: 'Basic YWRtaW46YWRtaW4=',
});
