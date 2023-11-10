import { Component, OnDestroy, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import { AccountService } from 'app/core/auth/account.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AccountDTO } from 'api-client';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  account: AccountDTO | null = null;
  private renderer: Renderer2;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private titleService: Title,
    private router: Router,
    private translateService: TranslateService,
    rootRenderer: RendererFactory2
  ) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.updateTitle();
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }

  private getPageTitle(routeSnapshot: ActivatedRouteSnapshot): string {
    const title: string = routeSnapshot.data['pageTitle'] ?? '';
    if (routeSnapshot.firstChild) {
      return this.getPageTitle(routeSnapshot.firstChild) || title;
    }
    return title;
  }

  private updateTitle(): void {
    let pageTitle = this.getPageTitle(this.router.routerState.snapshot.root);
    if (!pageTitle) {
      pageTitle = 'global.title';
    }
    this.translateService.get(pageTitle).subscribe(title => this.titleService.setTitle(title));
  }
}
