import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nr-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent {
  menuOpen = true;

  constructor() {
    if (window.innerWidth < 800) {
      this.menuOpen = false;
    }
  }
}
