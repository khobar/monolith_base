import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, debounceTime, ReplaySubject, switchMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { AccountService } from 'app/core/auth/account.service';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';
import { UserManagementDeleteDialogComponent } from '../delete/user-management-delete-dialog.component';
import { map } from 'rxjs/operators';
import { AccountDTO, AccountsService, Page, Pageable } from 'api-client';
import { GenericPage } from '../../../models/GenericPage';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  currentAccount: AccountDTO | null = null;
  displayedColumns: string[] = [
    'id',
    'login',
    'email',
    'activated',
    'langKey',
    'authorities',
    'createdDate',
    'lastModifiedBy',
    'lastModifiedDate',
    'actions',
  ];
  size$ = new ReplaySubject<number>();
  number$ = new ReplaySubject<number>();
  sort$ = new ReplaySubject<string>();
  pageable$ = combineLatest([this.size$, this.number$, this.sort$]).pipe(
    debounceTime(1), // debounce as it would trigger multiple calls to API if size and number change
    map(
      ([size, page, sort]: [number, number, string]): Pageable => ({
        size,
        page,
        sort,
      })
    )
  );
  page$ = this.pageable$.pipe(
    switchMap((pageable: Pageable) => this.accountsServiceAPI.getAccounts(pageable)),
    map((page: Page): GenericPage<AccountDTO> => page as GenericPage<AccountDTO>)
  );

  constructor(
    private userService: UserManagementService,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private accountsServiceAPI: AccountsService
  ) {
    this.size$.next(ITEMS_PER_PAGE);
    this.sort$.next('createdDate,asc');
    this.number$.next(0);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => (this.currentAccount = account));
  }

  setActive(user: User, isActivated: boolean): void {
    this.userService.update({ ...user, activated: isActivated }).subscribe(() => this.reloadAccounts());
  }

  sortChange(sortState: Sort): void {
    this.sort$.next(`${sortState.active},${sortState.direction}`);
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.reloadAccounts();
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.size$.next(event.pageSize);
    this.number$.next(event.pageIndex);
  }
  reloadAccounts(): void {
    this.page$ = this.pageable$.pipe(
      switchMap((pageable: Pageable) => this.accountsServiceAPI.getAccounts(pageable)),
      map((page: Page): GenericPage<AccountDTO> => page as GenericPage<AccountDTO>)
    );
  }
}
