import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PasswordResetInitService } from './password-reset-init.service';
import { AlertService, AlertType } from '../../../core/util/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jhi-password-reset-init',
  templateUrl: './password-reset-init.component.html',
})
export class PasswordResetInitComponent implements AfterViewInit {
  @ViewChild('email', { static: false })
  email?: ElementRef;

  resetRequestForm = this.fb.group({
    email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
  });

  constructor(
    private passwordResetInitService: PasswordResetInitService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (this.email) {
      this.email.nativeElement.focus();
    }
  }

  requestReset(): void {
    this.passwordResetInitService.save(this.resetRequestForm.get(['email'])!.value).subscribe({
      next: () => {
        this.router.navigate(['/']).then(() => {
          this.alertService.addAlert({
            type: AlertType.success,
            translationKey: 'reset.request.messages.success',
          });
        });
      },
      error: error => {
        this.alertService.addAlert({ type: AlertType.danger, translationKey: 'password.messages.error' });
        console.error(error);
      },
    });
  }
}
