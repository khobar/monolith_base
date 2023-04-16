import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable, Subject, tap } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { AccountDTO, AccountsService } from 'api-client';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  account: AccountDTO | null = null;

  private readonly destroy$ = new Subject<void>();
  accounts$!: Observable<AccountDTO[]>;
  loading: boolean = false;

  constructor(private accountService: AccountService, private router: Router, private accountsService: AccountsService) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.accounts$ = this.accountsService.getAccounts().pipe(
      shareReplay(),
      finalize(() => {
        this.loading = false;
      }),
      tap(() => {
        this.loading = true;
      })
    );
  }
}
