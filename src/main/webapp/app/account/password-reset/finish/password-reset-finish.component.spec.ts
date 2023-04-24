import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PasswordResetFinishComponent } from './password-reset-finish.component';
import { PasswordResetFinishService } from './password-reset-finish.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService, AlertType } from '../../../core/util/alert.service';

describe('PasswordResetFinishComponent', () => {
  let fixture: ComponentFixture<PasswordResetFinishComponent>;
  let comp: PasswordResetFinishComponent;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([]), TranslateModule.forRoot()],
      declarations: [PasswordResetFinishComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ key: 'XYZPDQ' }) },
        },
      ],
    })
      .overrideTemplate(PasswordResetFinishComponent, '')
      .createComponent(PasswordResetFinishComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetFinishComponent);
    comp = fixture.componentInstance;
    comp.ngOnInit();
  });

  it('should define its initial state', () => {
    expect(comp.initialized).toBe(true);
    expect(comp.key).toEqual('XYZPDQ');
  });

  it('sets focus after the view has been initialized', () => {
    const node = {
      focus: jest.fn(),
    };
    comp.newPassword = new ElementRef(node);

    comp.ngAfterViewInit();

    expect(node.focus).toHaveBeenCalled();
  });

  it('should show error if passwords do not match', () => {
    fakeAsync(() => {
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

  it('should update success to true after resetting password', inject(
    [PasswordResetFinishService, AlertService],
    fakeAsync((service: PasswordResetFinishService, alertService: AlertService) => {
      jest.spyOn(service, 'save').mockReturnValue(of({}));
      jest.spyOn(alertService, 'addAlert');
      const mockRouter = TestBed.inject(Router);
      jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
      comp.passwordForm.patchValue({
        newPassword: 'password',
        confirmPassword: 'password',
      });

      comp.finishReset();
      tick();

      expect(service.save).toHaveBeenCalledWith('XYZPDQ', 'password');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(alertService.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AlertType.success,
        })
      );
      flush();
    })
  ));

  it('should notify of generic error', inject(
    [PasswordResetFinishService],
    fakeAsync((service: PasswordResetFinishService) => {
      jest.spyOn(service, 'save').mockReturnValue(throwError('ERROR'));
      comp.passwordForm.patchValue({
        newPassword: 'password',
        confirmPassword: 'password',
      });

      comp.finishReset();
      tick();

      expect(service.save).toHaveBeenCalledWith('XYZPDQ', 'password');
      expect(comp.success).toBe(false);
      expect(comp.error).toBe(true);
    })
  ));
});
