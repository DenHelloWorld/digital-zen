import { ChangeDetectionStrategy, Component, model, ModelSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFocus } from '../../../common';
import { DEFAULT_POMODORO_SETTINGS } from '../../services/pomodoro.service';

@Component({
  selector: 'dz-pomodoro-settings',
  templateUrl: './pomodoro-settings.component.html',
  styleUrls: ['./pomodoro-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class PomodoroSettingsComponent {
  public readonly settings: ModelSignal<IFocus.PomodoroSettings> =
    model<IFocus.PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);

  protected onToggleEnabled(): void {
    const current = this.settings();
    this.settings.set({ ...current, enabled: !current.enabled });
  }

  protected onWorkDurationChange(value: string): void {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 1 && duration <= 120) {
      const current = this.settings();
      this.settings.set({ ...current, workDuration: duration });
    }
  }

  protected onShortBreakChange(value: string): void {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 1 && duration <= 30) {
      const current = this.settings();
      this.settings.set({ ...current, shortBreakDuration: duration });
    }
  }

  protected onLongBreakChange(value: string): void {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 5 && duration <= 60) {
      const current = this.settings();
      this.settings.set({ ...current, longBreakDuration: duration });
    }
  }

  protected onPomodorosUntilLongBreakChange(value: string): void {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 2 && count <= 10) {
      const current = this.settings();
      this.settings.set({ ...current, pomodorosUntilLongBreak: count });
    }
  }

  protected onToggleAutoStartBreaks(): void {
    const current = this.settings();
    this.settings.set({ ...current, autoStartBreaks: !current.autoStartBreaks });
  }

  protected onToggleAutoStartPomodoros(): void {
    const current = this.settings();
    this.settings.set({ ...current, autoStartPomodoros: !current.autoStartPomodoros });
  }

  protected onToggleSoundEnabled(): void {
    const current = this.settings();
    this.settings.set({ ...current, soundEnabled: !current.soundEnabled });
  }

  protected onVolumeChange(value: string): void {
    const volume = parseInt(value, 10);
    if (!isNaN(volume) && volume >= 0 && volume <= 100) {
      const current = this.settings();
      this.settings.set({ ...current, soundVolume: volume });
    }
  }
}
