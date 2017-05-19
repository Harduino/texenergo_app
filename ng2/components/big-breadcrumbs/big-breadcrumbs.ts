import { Component, Input } from '@angular/core';

@Component({
  selector: 'big-breadcrumbs',
  templateUrl: 'ng2/components/big-breadcrumbs/big-breadcrumbs.html'
})

export class BigBreadcrumbsComponent {
  @Input()

  set items(items: string[]) {
    this.firstItem = items[0];
    this.restItems = items.slice(1, items.length);
  }

  get items(): string[] {
    return [];
  }

  @Input() icon: string = 'home';

  firstItem: string = '';
  restItems: string[] = [];
}
