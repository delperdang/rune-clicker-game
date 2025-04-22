import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GameDataService } from '../../services/game-data.service';

@Component({
  selector: 'app-reset-progress',
  templateUrl: './reset-progress.component.html',
  styleUrls: ['./reset-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class ResetProgressComponent {
  showConfirmation = false;

  constructor(private gameDataService: GameDataService) {}

  askConfirmation(): void {
    this.showConfirmation = true;
  }

  confirmReset(): void {
    console.log("User confirmed reset.");
    this.gameDataService.resetSkills();
    this.showConfirmation = false; // Hide confirmation after reset
  }

  cancelReset(): void {
    console.log("User cancelled reset.");
    this.showConfirmation = false;
  }
}