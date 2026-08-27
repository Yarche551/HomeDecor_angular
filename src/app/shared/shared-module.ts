import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordRepeatDirective } from './directives/password-repeat';
import { FormsModule } from '@angular/forms';
import { CountSelector } from './components/count-selector/count-selector';

@NgModule({
  declarations: [],
  imports: [CommonModule, PasswordRepeatDirective, FormsModule, CountSelector],
  exports: [PasswordRepeatDirective, CountSelector],
})
export class SharedModule {}
