import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss'],
})
export class SchedulingComponent implements OnInit {
  @Input() showDriftRange: boolean = true;
  @Output() childButtonEvent = new EventEmitter();
  @Output() dayNameButtonEvent = new EventEmitter();
  @Output() dateTimeButtonEvent = new EventEmitter();
  @Output() timeButtonEvent = new EventEmitter();
  @Output() driftDataValue = new EventEmitter<number>();
  @Output() selectedMin = new EventEmitter();
  @Output() saveButton = new EventEmitter<boolean>();



  repeatPeriod = [
    { value: 'Minutes-0', viewValue: 'Minutes' },
    { value: 'hourly-1', viewValue: 'Hourly' },
    { value: 'daily-2', viewValue: 'Daily' },
    { value: 'weekly-3', viewValue: 'Weekly' },
    { value: 'monthly-4', viewValue: 'Monthly' },
  ];

  repeatOnDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  
  repeatOnMin = [
    '2',
    '5',
    '10',
    '15',
    '30',
    '45',
  ];


invalidMinutes: boolean = false;
  repeatMode: any;
  day_name: any;
  selectedRepeatPeriod: any;
  model: NgbDateStruct | undefined;
  date: { year: number; month: number } | undefined;
  selectedRepeatMode: any;
  dayName: any;
  dateTime: FormGroup;
  dayForm: FormGroup;
  selectedTableSilverLayerNames: any[] = [];
  driftValue:any;
  value = 20;
  toolTipMsg = 'Click here to set Date/Time';
  selectedMinutes: string='2';
  formatLabel(driftValue: number): string {
    if (driftValue >= 1) {
          // this.driftValue=driftValue
      return Math.round(driftValue / 1) + '%';
    }
    return `${driftValue}`;
  }
  validateInput(event: Event) {
    this.selectedMin.emit(`${this.selectedMinutes}`);
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    inputElement.value = inputValue.replace(/[^0-9]/g, '');
    const minutes = parseInt(inputElement.value, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 99) {
      this.invalidMinutes = true;
    } else {
      this.invalidMinutes = false;
    }
  }
  constructor(
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private calendar: NgbCalendar
  ) {
    this.dateTime = this.formBuilder.group({
      date: [''],
      time: [''],
    });
    this.dayForm = this.formBuilder.group({
      day: [''],
    });
  }

  ngOnInit(): void {
    this.selectedMin.emit(`${this.selectedMinutes}`);
    this.repeatMode = 'Hourly';
    this.driftDataValue.emit(20);
  }

  selectToday() {
    this.model = this.calendar.getToday();
  }
  onSliderChange(event:any) {
    this.driftDataValue.emit(event.target.value);
  }

  getDayName(day: any, event: any) {
    if (event.target.checked) {
      this.selectedTableSilverLayerNames.push(event.target.value);
    } else if (!event.target.checked) {
      this.selectedTableSilverLayerNames =
        this.selectedTableSilverLayerNames.filter(function (item) {
          return item !== event.target.value;
        });
    }
    this.dayNameButtonEvent.emit(`${this.selectedTableSilverLayerNames}`);
  }

  selectedRepeat(e: any) {
    this.repeatMode = e.target.value;
    this.childButtonEvent.emit(`${this.repeatMode}`);
  }
  selectedRepeatMin(e: any){
    this.selectedMin.emit(`${this.selectedMinutes}`);

  }

  submitDateTime() {
    this.dateTimeButtonEvent.emit(`${this.dateTime.value.date}`);
    this.timeButtonEvent.emit(`${this.dateTime.value.time}`);
    this.toolTipMsg = 'Saved';
  }

  setDateTime(event: any) {
    this.toolTipMsg = 'Click here to set Date/Time';
  }
}
