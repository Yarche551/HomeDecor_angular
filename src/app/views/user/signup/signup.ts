import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgStyle } from '@angular/common';
import { PasswordRepeatDirective } from '../../../shared/directives/password-repeat';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { LoginResponseType } from '../../../../types/login-response.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, NgStyle, PasswordRepeatDirective],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Signup {
  public authService = inject(Auth);
  private _snackBar = inject(MatSnackBar);
  public fb = inject(FormBuilder);

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)],
    ],
    passwordRepeat: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)],
    ],
    agree: [false, [Validators.requiredTrue]],
  });

  constructor(public router: Router) {}

  signup() {
    if (this.signupForm.valid
      && this.signupForm.value.email
      && this.signupForm.value.password
      && this.signupForm.value.passwordRepeat
      && this.signupForm.value.agree) {

      this.authService
        .signup(
          this.signupForm.value.email,
          this.signupForm.value.password,
          this.signupForm.value.passwordRepeat,
        )
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType) => {
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
            this._snackBar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          },
        });
    }
  }
}
