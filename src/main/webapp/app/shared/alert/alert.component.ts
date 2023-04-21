import { Component, OnDestroy, OnInit } from '@angular/core';

import { Alert, AlertService, AlertType } from 'app/core/util/alert.service';
import { alertAnimationTrigger } from './utils';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [alertAnimationTrigger],
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alerts = this.alertService.get();
  }

  setClasses(alert: Alert): { [key: string]: boolean } {
    const classes = { toast: Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

  close(alert: Alert): void {
    alert.close?.(this.alerts);
  }

  protected readonly AlertType = AlertType;
}
