import { Component, OnInit, OnDestroy, HostBinding, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameDataService } from '../../services/game-data.service';
import { Skill } from '../../services/skill.model';

@Component({
  selector: 'app-celebration-overlay',
  templateUrl: './celebration-overlay.component.html',
  styleUrls: ['./celebration-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class CelebrationOverlayComponent implements OnInit, OnDestroy {
  @HostBinding('class.visible') showOverlay = false;

  celebratedSkill: Skill | null = null;

  private celebrationSub: Subscription | null = null;
  private overlayTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private gameDataService: GameDataService,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.celebrationSub = this.gameDataService.skillReachedMaxLevel$.subscribe(skill => {
      if (skill) {
        this.celebratedSkill = skill; // Store the skill data
        this.showOverlay = true; // Set flag to show overlay (triggers host binding)
        this.cdRef.markForCheck(); // Notify Angular

        clearTimeout(this.overlayTimeout);

        this.overlayTimeout = setTimeout(() => {
          this.showOverlay = false;
          this.celebratedSkill = null; // Clear the celebrated skill
          this.cdRef.markForCheck(); // Notify Angular
        }, 3000); // MAX_LEVEL_CELEBRATION_DURATION_MS
      }
    });
  }

  ngOnDestroy(): void {
    this.celebrationSub?.unsubscribe();
    clearTimeout(this.overlayTimeout);
  }
}