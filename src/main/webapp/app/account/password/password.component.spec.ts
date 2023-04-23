import { AccountDTO } from 'api-client';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';

import { PasswordComponent } from './password.component';
import { PasswordService } from './password.service';
import { TranslateService } from '@ngx-translate/core';

jest.mock('app/core/auth/account.service');

describe('PasswordComponent', () => {
  let comp: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;
  let service: PasswordService;
  let accountService: AccountService;
  const account: AccountDTO = {
    firstName: 'John',
    lastName: 'Doe',
    activated: true,
    email: 'john.doe@mail.com',
    langKey: 'pl',
    login: 'john',
    authorities: new Set(),
    imageUrl: '',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PasswordComponent],
      providers: [FormBuilder, AccountService, TranslateService],
    })
      // .overrideTemplate(PasswordComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PasswordService);
    accountService = TestBed.inject(AccountService);
    accountService.identity = jest.fn(() => of(account));
  });

  it('should show error if passwords do not match', () => {
    fakeAsync((mockTranslateService: TranslateService) => {
      mockTranslateService.currentLang = 'pl';
      comp.passwordForm.patchValue({
        newPassword: 'password1',
        confirmPassword: 'password2',
      });
      // WHEN
      fixture.detectChanges();
      // THEN
      const submitBtn = fixture.debugElement.nativeElement.querySelector('#password-submit');
      expect(submitBtn.disabled).toBeTruthy();
    });
    // GIVEN
  });

  it('should call Auth.changePassword when passwords match', () => {
    // GIVEN
    const passwordValues = {
      currentPassword: 'oldPassword',
      newPassword: 'myPassword',
    };

    jest.spyOn(service, 'save').mockReturnValue(of(new HttpResponse({ body: true })));

    comp.passwordForm.patchValue({
      currentPassword: passwordValues.currentPassword,
      newPassword: passwordValues.newPassword,
      confirmPassword: passwordValues.newPassword,
    });

    // WHEN
    comp.changePassword();

    // THEN
    expect(service.save).toHaveBeenCalledWith(passwordValues.newPassword, passwordValues.currentPassword);
  });

  it('should set success to true upon success', () => {
    // GIVEN
    jest.spyOn(service, 'save').mockReturnValue(of(new HttpResponse({ body: true })));
    comp.passwordForm.patchValue({
      newPassword: 'myPassword',
      confirmPassword: 'myPassword',
    });

    // WHEN
    comp.changePassword();

    // THEN
    expect(comp.error).toBe(false);
    expect(comp.success).toBe(true);
  });

  it('should notify of error if change password fails', () => {
    // GIVEN
    jest.spyOn(service, 'save').mockReturnValue(throwError('ERROR'));
    comp.passwordForm.patchValue({
      newPassword: 'myPassword',
      confirmPassword: 'myPassword',
    });

    // WHEN
    comp.changePassword();

    // THEN
    expect(comp.success).toBe(false);
    expect(comp.error).toBe(true);
  });
});
