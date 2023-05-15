import { AccountDTO, AccountsService, Page } from 'api-client';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';
import { AccountService } from 'app/core/auth/account.service';

import { UserManagementComponent } from './user-management.component';
import { MaterialModule } from '../../../shared/material/material.module';
import { GenericPage } from '../../../models/GenericPage';
import { By } from '@angular/platform-browser';

jest.mock('app/core/auth/account.service');

describe('User Management Component', () => {
  let comp: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let service: AccountsService;
  let userService: UserManagementService;
  let mockAccountService: AccountService;
  const data = of({
    defaultSort: 'id,asc',
  });
  const queryParamMap = of(
    jest.requireActual('@angular/router').convertToParamMap({
      page: '1',
      size: '1',
      sort: 'id,desc',
    })
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [UserManagementComponent],
      providers: [{ provide: ActivatedRoute, useValue: { data, queryParamMap } }, AccountService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(AccountsService);
    userService = TestBed.inject(UserManagementService);
    mockAccountService = TestBed.inject(AccountService);
    mockAccountService.identity = jest.fn(() => of(null));
    fixture.detectChanges();
  });

  describe('OnInit', () => {
    it('Should call load all on init', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const headers = new HttpHeaders().append('link', 'link;link');
        const user: AccountDTO = {
          email: 'john@doe.com',
          langKey: 'pl',
          login: 'john',
          id: 123,
        };
        const page: GenericPage<AccountDTO> = {
          content: [user],
          totalPages: 1,
          totalElements: 0,
          size: 0,
          number: 0,
        };
        jest.spyOn(service, 'getAccounts').mockReturnValue(
          of(
            new HttpResponse({
              body: page,
            })
          )
        );
        // WHEN
        comp.ngOnInit();
        tick(); // simulate async
        expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Użytkownicy');
        const table = fixture.debugElement.query(By.css('table'));
        expect(table).toBeTruthy();
        flush();
      })
    ));
  });

  describe('setActive', () => {
    it('Should update user and call load all', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const headers = new HttpHeaders().append('link', 'link;link');
        const user = new User(123);
        const page: Page = {
          content: [user],
          totalPages: 1,
          totalElements: 1,
          size: 1,
          number: 0,
        };
        jest.spyOn(service, 'getAccounts').mockReturnValue(
          of(
            new HttpResponse({
              body: page,
              headers,
            })
          )
        );
        jest.spyOn(userService, 'update').mockReturnValue(of(user));

        // WHEN
        comp.setActive(user, true);
        tick(); // simulate async

        // THEN
        expect(userService.update).toHaveBeenCalledWith({ ...user, activated: true });
        //verify users were loaded/updated
      })
    ));
  });
});
