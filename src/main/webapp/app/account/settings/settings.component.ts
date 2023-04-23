import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { LANGUAGES } from 'app/config/language.constants';
import { AccountDTO } from 'api-client';
import { AlertService, AlertType } from '../../core/util/alert.service';

const initialAccount: AccountDTO = {} as AccountDTO;

@Component({
  selector: 'jhi-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  languages = LANGUAGES;

  settingsForm = new FormGroup({
    firstName: new FormControl(initialAccount.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl(initialAccount.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl(initialAccount.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    langKey: new FormControl(initialAccount.langKey, { nonNullable: true }),

    activated: new FormControl(initialAccount.activated, { nonNullable: true }),
    authorities: new FormControl(initialAccount.authorities, { nonNullable: true }),
    imageUrl: new FormControl(initialAccount.imageUrl, { nonNullable: true }),
    login: new FormControl(initialAccount.login, { nonNullable: true }),
  });

  constructor(private accountService: AccountService, private translateService: TranslateService, private alertService: AlertService) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.settingsForm.patchValue(account);
      }
    });
  }

  save(): void {
    const account = this.settingsForm.getRawValue();
    this.accountService.save(account).subscribe(
      () => {
        this.accountService.authenticate(account);
        if (account.langKey !== this.translateService.currentLang) {
          this.translateService.use(account.langKey);
        }
        this.alertService.addAlert({ type: AlertType.success, translationKey: 'settings.messages.success' });
      },
      error => {
        this.alertService.addAlert({ type: AlertType.danger, translationKey: 'settings.messages.error' });
        console.log(error);
      }
    );
  }
}
