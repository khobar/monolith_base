import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { PasswordResetInitComponent } from './password-reset-init.component';
import { PasswordResetInitService } from './password-reset-init.service';
import { AlertService, AlertType } from '../../../core/util/alert.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

describe('PasswordResetInitComponent', () => {
  let fixture: ComponentFixture<PasswordResetInitComponent>;
  let comp: PasswordResetInitComponent;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [PasswordResetInitComponent],
      providers: [FormBuilder],
    })
      .overrideTemplate(PasswordResetInitComponent, '')
      .createComponent(PasswordResetInitComponent);
    comp = fixture.componentInstance;
  });

  it('sets focus after the view has been initialized', () => {
    const node = {
      focus: jest.fn(),
    };
    comp.email = new ElementRef(node);

    comp.ngAfterViewInit();

    expect(node.focus).toHaveBeenCalled();
  });

  it('notifies of success upon successful requestReset', inject(
    [PasswordResetInitService, AlertService, Router],
    fakeAsync((service: PasswordResetInitService, alertService: AlertService, router: Router) => {
      jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(alertService, 'addAlert');
      jest.spyOn(service, 'save').mockReturnValue(of({}));
      comp.resetRequestForm.patchValue({
        email: 'user@domain.com',
      });

      comp.requestReset();
      tick();
      expect(service.save).toHaveBeenCalledWith('user@domain.com');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(alertService.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: AlertType.success }));
      flush();
    })
  ));

  it('no notification of success upon error response', inject(
    [PasswordResetInitService, AlertService, Router],
    fakeAsync((service: PasswordResetInitService, alertService: AlertService) => {
      jest.spyOn(alertService, 'addAlert');
      jest.spyOn(service, 'save').mockReturnValue(
        throwError({
          status: 503,
          data: 'something else',
        })
      );
      comp.resetRequestForm.patchValue({
        email: 'user@domain.com',
      });
      comp.requestReset();
      expect(service.save).toHaveBeenCalledWith('user@domain.com');
      tick();
      expect(alertService.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: AlertType.danger }));
      flush();
    })
  ));
});
