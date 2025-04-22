import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GameDataService } from '../../services/game-data.service';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-reset-progress',
  standalone: true, // Ensure standalone is true
  imports: [ CommonModule ], // Add CommonModule to imports
  templateUrl: './reset-progress.component.html',
  styleUrls: ['./reset-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    this.showConfirmation = false;
  }

  cancelReset(): void {
    console.log("User cancelled reset.");
    this.showConfirmation = false;
  }
}