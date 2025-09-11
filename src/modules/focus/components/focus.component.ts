import {ChangeDetectionStrategy, Component, inject, OnInit, Signal, WritableSignal} from '@angular/core';
import {FocusService} from '../services';
import {IFocus} from '../../common/models';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusComponent implements OnInit {
  #focusService: FocusService = inject(FocusService);

  protected readonly isFocused: Signal<boolean> = this.#focusService.isFocused;
  protected readonly focuses: Signal<IFocus.Base[]> = this.#focusService.entities;

  public ngOnInit(): void {
    console.log('ngOnInit', this.isFocused());
    return;
  }

  protected toggleFocus(): void {
    if(this.isFocused()){
      this.stopFocus();
      console.log('stopFocus');
    } else {
      this.startTestFocus();
      console.log('startTestFocus');
    }
  }

  protected startTestFocus(): void {
    // 1. Create a mock period object with all required properties.
    const dummyPeriod: IFocus.Period = {
      id: 'dummy-period-123',
      name: 'Test Focus Period',
      description: 'A temporary period for testing.',
      startFrom: new Date(),
      endTo: new Date(Date.now() + 60 * 1000), // Ends in 1 minute
      blockedSites: [
        {
          id: 'dummy-site-1',
          name: 'Dummy Site',
          description: 'A test blocked site.',
          url: 'facebook.com',
          imageUrl: ''
        },
      ],
    };

    this.#focusService.remove('dummy-base-123');

    // 2. Add the dummy period to the service's local state.
    // This simulates the period being present in your application.
    this.#focusService.add({
      id: 'dummy-base-123',
      name: 'Test Focus Base',
      description: '',
      periods: [dummyPeriod],
    });

    // 3. Start the focus using the dummy period's ID.
    setTimeout(()=> {
      this.#focusService.startFocus(dummyPeriod.id);
    }, 2000)
  }

  protected stopFocus(): void {
    this.#focusService.stopFocus();
  }
}
