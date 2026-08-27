import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderType } from '../../../types/order.type';
import { OrderRequestType } from '../../../types/order-request.type';
import { DefaultResponseType } from '../../../types/default-response.type';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  createOrder(params: OrderRequestType): Observable<OrderType | DefaultResponseType> {
    return this.http.post<OrderType | DefaultResponseType>(environment.api + 'orders', params);
  }

  getOrders(): Observable<OrderType[] | DefaultResponseType> {
    return this.http.get<OrderType[] | DefaultResponseType>(environment.api + 'orders');
  }
}
