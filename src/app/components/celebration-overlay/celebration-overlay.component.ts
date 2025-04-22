import { Component, OnInit, OnDestroy, HostBinding, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameDataService } from '../../services/game-data.service';
import { Skill } from '../../services/skill.model';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-celebration-overlay',
  standalone: true, // Ensure standalone is true
  imports: [ CommonModule ], // Add CommonModule to imports
  templateUrl: './celebration-overlay.component.html',
  styleUrls: ['./celebration-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CelebrationOverlayComponent implements OnInit, OnDestroy {
  @HostBinding('class.visible') showOverlay = false;
  celebratedSkill: Skill | null = null;
  private celebrationSub: Subscription | null = null;
  private overlayTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private gameDataService: GameDataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.celebrationSub = this.gameDataService.skillReachedMaxLevel$.subscribe(skill => {
      if (skill) {
        this.celebratedSkill = skill;
        this.showOverlay = true;
        this.cdRef.markForCheck();

        // Fix: Check if timeout exists before clearing
        if (this.overlayTimeout !== null) {
          clearTimeout(this.overlayTimeout);
        }

        this.overlayTimeout = setTimeout(() => {
          this.showOverlay = false;
          this.celebratedSkill = null;
          this.cdRef.markForCheck();
        }, 3000);
      }
    });
  }

  ngOnDestroy(): void {
    this.celebrationSub?.unsubscribe();
    if (this.overlayTimeout !== null) {
      clearTimeout(this.overlayTimeout);
    }
  }
}