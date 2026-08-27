import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'count-selector',
  imports: [FormsModule],
  templateUrl: './count-selector.html',
  styleUrl: './count-selector.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class CountSelector {
  @Input() count: number = 1;

  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();

  countChange(): void {
    const value = Number.parseInt(String(this.count), 10);
    this.count = !value || value < 1 ? 1 : value;
    this.onCountChange.emit(this.count);
  }

  decreaseCount(): void {
    if (this.count > 1) {
      this.count--;
      this.onCountChange.emit(this.count);
    }
  }

  increaseCount(): void {
    this.count++;
    this.onCountChange.emit(this.count);
  }
}
