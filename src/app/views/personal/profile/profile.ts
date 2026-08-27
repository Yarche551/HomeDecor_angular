import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../shared/services/user';
import { UserInfoType } from '../../../../types/user-info.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { DeliveryType, PaymentType } from '../../../../types/enums.type';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);

  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;
  deliveryType: DeliveryType = DeliveryType.delivery;

  userForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    fatherName: [''],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    paymentType: [PaymentType.cashToCourier as string],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
  });

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe({
      next: (data) => {
        if ((data as DefaultResponseType).error !== undefined) {
          this._snackBar.open((data as DefaultResponseType).message);
          return;
        }

        const userInfo = data as UserInfoType;
        if (userInfo.deliveryType) {
          this.deliveryType =
            userInfo.deliveryType === DeliveryType.self ? DeliveryType.self : DeliveryType.delivery;
        }

        this.userForm.setValue({
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
        });
        this.userForm.markAsPristine();
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Не удалось получить данные пользователя');
      },
    });
  }

  changeDeliveryType(type: DeliveryType): void {
    if (this.deliveryType === type) {
      return;
    }
    this.deliveryType = type;
    this.userForm.markAsDirty();
  }

  updateUserInfo(): void {
    const value = this.userForm.value;

    // бэкенд не принимает пустые строки — отправляем только заполненные поля,
    // остальные он очистит сам
    const paramsToUpdate: UserInfoType = {
      deliveryType: this.deliveryType,
    };

    if (value.email) paramsToUpdate.email = value.email;
    if (value.firstName) paramsToUpdate.firstName = value.firstName;
    if (value.lastName) paramsToUpdate.lastName = value.lastName;
    if (value.fatherName) paramsToUpdate.fatherName = value.fatherName;
    if (value.phone) paramsToUpdate.phone = value.phone;
    if (value.paymentType) paramsToUpdate.paymentType = value.paymentType;

    if (this.deliveryType === DeliveryType.delivery) {
      if (value.street) paramsToUpdate.street = value.street;
      if (value.house) paramsToUpdate.house = value.house;
      if (value.entrance) paramsToUpdate.entrance = value.entrance;
      if (value.apartment) paramsToUpdate.apartment = value.apartment;
    }

    this.userService.updateUserInfo(paramsToUpdate).subscribe({
      next: (data: DefaultResponseType) => {
        if (data.error) {
          this._snackBar.open(data.message);
          return;
        }
        this.userForm.markAsPristine();
        this._snackBar.open('Данные успешно сохранены');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Не удалось сохранить данные');
      },
    });
  }
}
