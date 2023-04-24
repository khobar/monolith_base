import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PasswordResetFinishService } from './password-reset-finish.service';
import { AlertService, AlertType } from '../../../core/util/alert.service';

@Component({
  selector: 'jhi-password-reset-finish',
  templateUrl: './password-reset-finish.component.html',
})
export class PasswordResetFinishComponent implements OnInit, AfterViewInit {
  @ViewChild('newPassword', { static: false })
  newPassword?: ElementRef;

  initialized = false;
  error = false;
  success = false;
  key = '';

  passwordForm = new FormGroup(
    {
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
      }),
    },
    { validators: this.matchingPasswords }
  );

  constructor(
    private passwordResetFinishService: PasswordResetFinishService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {}

  matchingPasswords(c: AbstractControl): { [key: string]: boolean } | null {
    const password = c.get(['newPassword']);
    const confirmPassword = c.get(['confirmPassword']);
    return password && confirmPassword && password.value !== confirmPassword.value ? { notSame: true } : null;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['key']) {
        this.key = params['key'];
      }
      this.initialized = true;
    });
  }

  ngAfterViewInit(): void {
    if (this.newPassword) {
      this.newPassword.nativeElement.focus();
    }
  }

  finishReset(): void {
    const { newPassword } = this.passwordForm.getRawValue();
    this.passwordResetFinishService.save(this.key, newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']).then(() => {
          this.alertService.addAlert({ type: AlertType.success, translationKey: 'reset.finish.messages.success' });
        });
      },
      error: () => (this.error = true),
    });
  }
}
