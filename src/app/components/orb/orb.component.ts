import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameDataService } from '../../services/game-data.service';
import { CommonModule } from '@angular/common'; // Import CommonModule

interface XpPopupInfo {
  id: number;
  skillName: string;
  xpAmount: number;
}

@Component({
  selector: 'app-orb',
  standalone: true, // Ensure standalone is true
  imports: [ CommonModule ], // Add CommonModule to imports
  templateUrl: './orb.component.html',
  styleUrls: ['./orb.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrbComponent implements OnInit, OnDestroy {
  activePopups: XpPopupInfo[] = [];
  private popupIdCounter = 0;
  private xpSub: Subscription | null = null;

  constructor(
    private gameDataService: GameDataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.xpSub = this.gameDataService.xpGained$.subscribe(xpInfo => {
      if (xpInfo) {
        this.showXpPopup(xpInfo.skillName, xpInfo.xpAmount);
      }
    });
  }

  ngOnDestroy(): void {
    this.xpSub?.unsubscribe();
  }

  onOrbClick(): void {
    this.gameDataService.addXpToRandomSkill();
  }

  showXpPopup(skillName: string, xpAmount: number): void {
    const newPopup: XpPopupInfo = {
      id: this.popupIdCounter++,
      skillName: skillName,
      xpAmount: xpAmount
    };
    this.activePopups = [...this.activePopups, newPopup];
    this.cdRef.markForCheck();

    setTimeout(() => {
      this.activePopups = this.activePopups.filter(p => p.id !== newPopup.id);
      this.cdRef.markForCheck();
    }, 1450);
  }
}