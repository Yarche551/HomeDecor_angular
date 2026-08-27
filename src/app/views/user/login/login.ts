import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { Auth } from '../../../core/auth/auth';
import { LoginResponseType } from '../../../../types/login-response.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Login implements OnInit {
  public authService = inject(Auth);
  private _snackBar = inject(MatSnackBar);
  public fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  constructor(public router: Router) {
  }

  ngOnInit(): void {}

  login(): void {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService
        .login(
          this.loginForm.value.email,
          this.loginForm.value.password,
          !!this.loginForm.value.rememberMe,
        )
        .subscribe({
          next: (data: LoginResponseType | DefaultResponseType) => {
            // перехват ошибки
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }
            const loginResponse = data as LoginResponseType;
            if (
              !loginResponse.accessToken ||
              !loginResponse.refreshToken ||
              !loginResponse.userId
            ) {
              error = 'ошибка авторизации';
            }
            if (error) {
              this._snackBar.open(error);
              return;
            }
            // --------- перехват ошибки закончился ---------

            // если успешный ответ
            this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
            this.authService.userId = loginResponse.userId;
            this._snackBar.open('Вы успешно авторизовались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('ошибка авторизации');
            }
          },
        });
    }
  }
}
