import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GameDataService } from '../../services/game-data.service';
import { Skill } from '../../services/skill.model';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ResetProgressComponent } from '../reset-progress/reset-progress.component'; // Import ResetProgressComponent

@Component({
  selector: 'app-skills-list',
  standalone: true, // Ensure standalone is true
  imports: [
    CommonModule, // Add CommonModule
    ResetProgressComponent // Add ResetProgressComponent
  ],
  templateUrl: './skills-list.component.html',
  styleUrls: ['./skills-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsListComponent implements OnInit, OnDestroy {
  skills: Skill[] = [];
  totalLevel$: Observable<number>;
  totalXp$: Observable<number>;
  private skillsSub: Subscription | null = null;
  private levelUpSub: Subscription | null = null;

  constructor(
    private gameDataService: GameDataService,
    private cdRef: ChangeDetectorRef
  ) {
    this.totalLevel$ = this.gameDataService.totalLevel$;
    this.totalXp$ = this.gameDataService.totalXp$;
  }

  ngOnInit(): void {
    this.skillsSub = this.gameDataService.skills$.subscribe(updatedSkills => {
      this.skills = updatedSkills.map(s => ({ ...s, levelUpFlash: false }));
      this.cdRef.markForCheck();
    });

    this.levelUpSub = this.gameDataService.skillLeveledUp$.subscribe(levelUpInfo => {
      if (levelUpInfo && this.skills[levelUpInfo.skillIndex]) {
        this.triggerLevelUpFlash(levelUpInfo.skillIndex);
      }
    });
  }

  ngOnDestroy(): void {
    this.skillsSub?.unsubscribe();
    this.levelUpSub?.unsubscribe();
  }

  triggerLevelUpFlash(skillIndex: number): void {
    const skill = this.skills[skillIndex];
    if (skill) {
      const newSkills = [...this.skills];
      newSkills[skillIndex] = { ...skill, levelUpFlash: true };
      this.skills = newSkills;
      this.cdRef.markForCheck();

      setTimeout(() => {
        const currentSkill = this.skills[skillIndex];
        if (currentSkill && currentSkill.levelUpFlash) {
          const resetSkills = [...this.skills];
          resetSkills[skillIndex] = { ...currentSkill, levelUpFlash: false };
          this.skills = resetSkills;
          this.cdRef.markForCheck();
        }
      }, 700);
    }
  }
}