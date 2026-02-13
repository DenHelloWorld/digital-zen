import { TabComponent } from './tab/tab.component';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
} from '@angular/core';

@Component({
  selector: 'dz-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) protected readonly tabs!: QueryList<TabComponent>;

  public ngAfterContentInit(): void {
    /**
     * If there is no active tab, activate the first one.
     * */
    if (!this.tabs.find((tab: TabComponent) => tab.position() === 'active') && this.tabs.first) {
      this.selectTab(this.tabs.first);
    }
  }

  protected selectTab(tab: TabComponent): void {
    const newIndex = this.tabs.toArray().indexOf(tab);

    this.tabs.forEach((t, i) => {
      if (i < newIndex) {
        t.position.set('left');
      } else if (i > newIndex) {
        t.position.set('right');
      }
    });

    tab.position.set('active');
  }
}
