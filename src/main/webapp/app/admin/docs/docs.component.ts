import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'jhi-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
})
export class DocsComponent {
  screenHeight: number | undefined;

  constructor() {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(): void {
    this.screenHeight = window.innerHeight - 100;
  }
}
