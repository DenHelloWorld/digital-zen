import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../services';

@Component({
  selector: 'dz-pomodoro-timer',
  templateUrl: './pomodoro-timer.component.html',
  styleUrls: ['./pomodoro-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class PomodoroTimerComponent {
  readonly #pomodoroService = inject(PomodoroService);

  protected readonly session = this.#pomodoroService.currentSession;
  protected readonly timeRemaining = this.#pomodoroService.timeRemainingFormatted;
  protected readonly settings = this.#pomodoroService.settings;
  protected readonly progressPercentage = this.#pomodoroService.progressPercentage;

  protected onStart(): void {
    this.#pomodoroService.startPomodoro();
  }

  protected onPause(): void {
    this.#pomodoroService.pausePomodoro();
  }

  protected onResume(): void {
    this.#pomodoroService.resumePomodoro();
  }

  protected onSkip(): void {
    this.#pomodoroService.skipPomodoro();
  }

  protected onReset(): void {
    this.#pomodoroService.resetPomodoro();
  }

  protected getStateLabel(state: string): string {
    switch (state) {
      case 'work':
        return 'Focus Time';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  }
}
