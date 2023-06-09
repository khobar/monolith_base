import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import { RegisterService } from './register.service';
import { AlertService, AlertType } from '../../core/util/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('login', { static: false })
  login?: ElementRef;
  registerForm = new FormGroup(
    {
      login: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
        ],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
      }),
    },
    { validators: [this.matchingPasswords] }
  );

  constructor(
    private translateService: TranslateService,
    private registerService: RegisterService,
    private alertService: AlertService,
    private router: Router
  ) {}

  matchingPasswords(c: AbstractControl): { [key: string]: boolean } | null {
    const password = c.get(['password']);
    const confirmPassword = c.get(['confirmPassword']);
    return password && confirmPassword && password.value !== confirmPassword.value ? { notSame: true } : null;
  }

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
  }

  register(): void {
    const { password } = this.registerForm.getRawValue();
    const { login, email } = this.registerForm.getRawValue();
    this.registerService.save({ login, email, password, langKey: this.translateService.currentLang }).subscribe({
      next: () => {
        this.router.navigate(['/login']).then(() => {
          this.alertService.addAlert({ type: AlertType.success, translationKey: 'register.messages.success' });
        });
      },
      error: response => this.processError(response),
    });
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.alertService.addAlert({ type: AlertType.danger, translationKey: 'register.messages.error.userexists' });
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.alertService.addAlert({ type: AlertType.danger, translationKey: 'register.messages.error.emailexists' });
    } else {
      this.alertService.addAlert({ type: AlertType.danger, translationKey: 'register.messages.error.fail' });
    }
  }
}
