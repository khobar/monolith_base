import { AccountDTO } from 'api-client';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';

import { SettingsComponent } from './settings.component';
import { AlertService, AlertType } from '../../core/util/alert.service';
import spyOn = jest.spyOn;

jest.mock('app/core/auth/account.service');

describe('SettingsComponent', () => {
  let comp: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockAccountService: AccountService;
  const account: AccountDTO = {
    firstName: 'John',
    lastName: 'Doe',
    activated: true,
    email: 'john.doe@mail.com',
    langKey: 'pl',
    login: 'john',
    authorities: new Set(),
    imageUrl: '',
    darkMode: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      declarations: [SettingsComponent],
      providers: [FormBuilder, AccountService, AlertService],
    })
      .overrideTemplate(SettingsComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    mockAccountService.identity = jest.fn(() => of(account));
    mockAccountService.getAuthenticationState = jest.fn(() => of(account));
  });

  it('should send the current identity upon save', () => {
    // GIVEN
    mockAccountService.save = jest.fn(() => of({}));
    const settingsFormValues = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@mail.com',
      langKey: 'pl',
    };

    // WHEN
    comp.ngOnInit();
    comp.save();

    // THEN
    expect(mockAccountService.identity).toHaveBeenCalled();
    expect(mockAccountService.save).toHaveBeenCalledWith(account);
    expect(mockAccountService.authenticate).toHaveBeenCalledWith(account);
    expect(comp.settingsForm.value).toMatchObject(expect.objectContaining(settingsFormValues));
  });

  it('should notify of success upon successful save', () => {
    // GIVEN
    const alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'addAlert');
    mockAccountService.save = jest.fn(() => of({}));
    // WHEN
    comp.ngOnInit();
    comp.save();
    // THEN
    expect(alertService.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: AlertType.success }));
  });

  it('should notify of error upon failed save', () => {
    // GIVEN
    const alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'addAlert');
    mockAccountService.save = jest.fn(() => throwError('ERROR'));

    // WHEN
    comp.ngOnInit();
    comp.save();

    // THEN
    expect(alertService.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: AlertType.danger }));
  });
});
