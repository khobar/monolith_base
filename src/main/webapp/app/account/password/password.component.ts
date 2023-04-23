import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { PasswordService } from './password.service';
import { AccountDTO } from 'api-client';

@Component({
  selector: 'jhi-password',
  templateUrl: './password.component.html',
})
export class PasswordComponent implements OnInit {
  error = false;
  success = false;
  account$?: Observable<AccountDTO | null>;
  passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
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

  constructor(private passwordService: PasswordService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.account$ = this.accountService.identity();
  }

  matchingPasswords(c: AbstractControl): { [key: string]: boolean } | null {
    const password = c.get(['newPassword']);
    const confirmPassword = c.get(['confirmPassword']);
    return password && confirmPassword && password.value !== confirmPassword.value ? { notSame: true } : null;
  }

  changePassword(): void {
    this.error = false;
    this.success = false;

    const { newPassword, currentPassword } = this.passwordForm.getRawValue();
    this.passwordService.save(newPassword, currentPassword).subscribe({
      next: () => (this.success = true),
      error: () => (this.error = true),
    });
  }
}
