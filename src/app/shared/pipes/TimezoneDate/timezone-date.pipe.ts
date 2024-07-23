import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timezoneDate'
})
export class TimezoneDatePipe implements PipeTransform {
  transform(value: any, format: string = 'medium', timezone: string = 'UTC'): any {
    const datePipe: DatePipe = new DatePipe('en-US');
    if (value) {
      const utcDate = new Date(value);
      const formattedDate = datePipe.transform(utcDate, format, timezone);
      return formattedDate;
    }
    return null;
  }
}
