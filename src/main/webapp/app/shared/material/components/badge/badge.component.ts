import { Component, Input } from '@angular/core';
import { BadgeType } from './badge.model';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  @Input() type?: BadgeType = BadgeType.INFO;
  @Input() rounded?: boolean;

  getBadgeClass(): string {
    return (this.rounded ? 'rounded ' : '') + this.getBadeTypeClass();
  }

  private getBadeTypeClass(): string {
    switch (this.type) {
      case BadgeType.SUCCESS:
        return 'badge-success';
      case BadgeType.WARNING:
        return 'badge-warn';
      case BadgeType.ERROR:
        return 'badge-error';
      default:
        return 'badge-info';
    }
  }
}
