import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponent } from './badge.component';
import { BadgeType } from './badge.model';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render badge with success type', () => {
    component.type = BadgeType.SUCCESS;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-success');
  });
  it('should render badge with error type', () => {
    component.type = BadgeType.ERROR;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-error');
  });
  it('should render badge with warning type', () => {
    component.type = BadgeType.WARNING;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-warn');
  });

  it('should render badge with info type', () => {
    component.type = BadgeType.INFO;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-info');
  });
});
