import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-refresh-page',
  templateUrl: './refresh-page.component.html',
  styleUrls: ['./refresh-page.component.scss']
})
export class RefreshPageComponent implements OnInit {
  ngOnInit(): void {

  }
  constructor(private location: Location) {
  }

  navigatePreviousPage() {
    this.location.back();
  }
}
