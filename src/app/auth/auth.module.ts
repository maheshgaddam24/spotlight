import { NgModule,  CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app-material.module';
import { AppComponent } from '../app.component';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,AppMaterialModule
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthModule { }