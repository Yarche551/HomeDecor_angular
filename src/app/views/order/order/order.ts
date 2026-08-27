import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart';
import { OrderService } from '../../../shared/services/order';
import { UserService } from '../../../shared/services/user';
import { Auth } from '../../../core/auth/auth';
import { DeliveryType, PaymentType } from '../../../../types/enums.type';
import { OrderRequestType } from '../../../../types/order-request.type';
import { OrderType } from '../../../../types/order.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { UserInfoType } from '../../../../types/user-info.type';
import { CartType } from '../../../../types/cart.type';

@Component({
  selector: 'app-order',
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './order.html',
  styleUrl: './order.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Order implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  cartService = inject(CartService);
  authService = inject(Auth);

  @ViewChild('popup') popup!: TemplateRef<unknown>;
  private dialogRef: MatDialogRef<unknown> | null = null;

  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;

  /** стоимость доставки, совпадает с config.deliveryCost на бэкенде */
  readonly deliveryCost: number = 10;

  /** доставка платная только при курьерской доставке */
  get currentDeliveryCost(): number {
    return this.deliveryType === DeliveryType.delivery ? this.deliveryCost : 0;
  }

  /** заказ оформлен — корзина очищена намеренно, редиректить не нужно */
  private orderCreated: boolean = false;

  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    fatherName: [''],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    paymentType: [PaymentType.cashToCourier as string, Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: [''],
  });

  deliveryType: DeliveryType = DeliveryType.delivery;

  totalAmount = computed(() =>
    this.cartService.cart().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  totalCount = computed(() => this.cartService.count());

  ngOnInit(): void {
    this.cartService.requestCart().subscribe((data) => {
      if ((data as DefaultResponseType).error !== undefined) {
        return;
      }
      this.cartService.cart.set(data as CartType);
      if (this.cartService.cart().items.length === 0 && !this.orderCreated) {
        this._snackBar.open('Корзина пуста — оформлять нечего');
        this.router.navigate(['/cart']);
      }
    });

    this.updateDeliveryTypeValidation();

    // для авторизованного пользователя подставляем данные из личного кабинета
    if (this.authService.getIsLoggedIn()) {
      this.userService.getUserInfo().subscribe((data) => {
        if ((data as DefaultResponseType).error !== undefined) {
          return;
        }
        const userInfo = data as UserInfoType;

        if (userInfo.deliveryType) {
          this.deliveryType =
            userInfo.deliveryType === DeliveryType.self ? DeliveryType.self : DeliveryType.delivery;
          this.updateDeliveryTypeValidation();
        }

        const paramsToUpdate = {
          firstName: userInfo.firstName ?? '',
          lastName: userInfo.lastName ?? '',
          fatherName: userInfo.fatherName ?? '',
          phone: userInfo.phone ?? '',
          email: userInfo.email ?? '',
          paymentType: userInfo.paymentType ?? PaymentType.cashToCourier,
          street: userInfo.street ?? '',
          house: userInfo.house ?? '',
          entrance: userInfo.entrance ?? '',
          apartment: userInfo.apartment ?? '',
          comment: '',
        };
        this.orderForm.setValue(paramsToUpdate);
      });
    }
  }

  changeDeliveryType(type: DeliveryType): void {
    this.deliveryType = type;
    this.updateDeliveryTypeValidation();
  }

  /** адрес обязателен только при доставке курьером */
  private updateDeliveryTypeValidation(): void {
    const street = this.orderForm.get('street');
    const house = this.orderForm.get('house');

    if (this.deliveryType === DeliveryType.delivery) {
      street?.setValidators(Validators.required);
      house?.setValidators(Validators.required);
    } else {
      street?.removeValidators(Validators.required);
      house?.removeValidators(Validators.required);
      street?.setValue('');
      house?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }

    street?.updateValueAndValidity();
    house?.updateValueAndValidity();
  }

  createOrder(): void {
    if (!this.orderForm.valid) {
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните обязательные поля');
      return;
    }

    const formValue = this.orderForm.value;

    const paramObject: OrderRequestType = {
      deliveryType: this.deliveryType,
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      phone: formValue.phone!,
      paymentType: formValue.paymentType!,
      email: formValue.email!,
    };

    // бэкенд не принимает пустые строки, поэтому отправляем только заполненные поля
    if (formValue.fatherName) {
      paramObject.fatherName = formValue.fatherName;
    }
    if (formValue.comment) {
      paramObject.comment = formValue.comment;
    }
    if (this.deliveryType === DeliveryType.delivery) {
      paramObject.street = formValue.street!;
      paramObject.house = formValue.house!;
      if (formValue.entrance) {
        paramObject.entrance = formValue.entrance;
      }
      if (formValue.apartment) {
        paramObject.apartment = formValue.apartment;
      }
    }

    this.orderService.createOrder(paramObject).subscribe({
      next: (data: OrderType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          this._snackBar.open((data as DefaultResponseType).message);
          return;
        }

        this.orderCreated = true;
        this.cartService.cart.set({ items: [] });
        this.dialogRef = this.dialog.open(this.popup, {
          panelClass: 'thanks-dialog',
          width: '727px',
          maxWidth: '95vw',
        });
        this.dialogRef.backdropClick().subscribe(() => this.router.navigate(['/']));
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Не удалось оформить заказ');
      },
    });
  }

  closePopup(): void {
    this.dialogRef?.close();
    this.router.navigate(['/']);
  }
}
