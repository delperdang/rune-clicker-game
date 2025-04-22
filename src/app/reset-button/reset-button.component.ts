import { Component } from '@angular/core';
import { SkillService } from '../skill.service';

@Component({
  selector: 'app-reset-button',
  standalone: true,
  imports: [
  ],
  templateUrl: './reset-button.component.html',
  styleUrls: ['./reset-button.component.css']
})
export class ResetButtonComponent {
  showConfirmation = false;

  constructor(private skillService: SkillService) {}

  onResetClick(): void {
    this.showConfirmation = true;
  }

  onConfirmReset(): void {
    console.log('Reset confirmed.');
    this.skillService.resetSkills();
    this.showConfirmation = false;
  }

  onCancelReset(): void {
    console.log('Reset cancelled.');
    this.showConfirmation = false;
  }
}