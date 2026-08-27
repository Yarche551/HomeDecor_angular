import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../../../shared/services/order';
import { OrderType } from '../../../../types/order.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { OrderStatus, OrderStatusLabels } from '../../../../types/enums.type';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private _snackBar = inject(MatSnackBar);

  orders: OrderType[] = [];

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        if ((data as DefaultResponseType).error !== undefined) {
          this._snackBar.open((data as DefaultResponseType).message);
          return;
        }
        // самые свежие заказы — сверху
        this.orders = (data as OrderType[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Не удалось получить список заказов');
      },
    });
  }

  getItemsCount(order: OrderType): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getStatusLabel(status: string): string {
    return OrderStatusLabels[status] ?? status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case OrderStatus.success:
        return 'status-success';
      case OrderStatus.cancelled:
        return 'status-cancelled';
      default:
        return 'status-active';
    }
  }
}
