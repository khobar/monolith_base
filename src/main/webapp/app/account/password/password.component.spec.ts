import { ComponentFixture, fakeAsync, flush, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';

import { PasswordComponent } from './password.component';
import { PasswordService } from './password.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService, AlertType } from '../../core/util/alert.service';
import spyOn = jest.spyOn;

jest.mock('app/core/auth/account.service');

describe('PasswordComponent', () => {
  let comp: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;
  let service: PasswordService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      declarations: [PasswordComponent],
      providers: [FormBuilder, AccountService],
    })
      .overrideTemplate(PasswordComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PasswordService);
  });
  afterEach(() => {
    jest.restoreAllMocks();
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
  it('should set success to true upon success', inject(
    [AlertService, PasswordService],
    fakeAsync((alertService: AlertService, passwordService: PasswordService) => {
      spyOn(passwordService, 'save').mockReturnValue(of(new HttpResponse({ body: true })));
      spyOn(alertService, 'addAlert');
      comp.passwordForm.patchValue({
        newPassword: 'myPassword',
        confirmPassword: 'myPassword',
      });
      // WHEN
      comp.changePassword();
      // THEN
      expect(alertService.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: AlertType.success }));
      flush();
    })
  ));
});
