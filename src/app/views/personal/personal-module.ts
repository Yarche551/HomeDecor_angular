import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonalRoutingModule } from './personal-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, PersonalRoutingModule, SharedModule, ReactiveFormsModule],
})
export class PersonalModule {}
