import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Skill, SkillService, LevelUpInfo } from './skill.service';
import { OrbComponent } from './orb/orb.component';
import { SkillsTableComponent } from './skills-table/skills-table.component';
import { ResetButtonComponent } from './reset-button/reset-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
      OrbComponent,
      SkillsTableComponent,
      ResetButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'rune-clicker-game';
  showCelebration = false;
  celebrationSkill: Skill | null = null;

  private levelUpSubscription: Subscription | null = null;
  private celebrationTimeout: any = null;
  private readonly MAX_LEVEL_CELEBRATION_DURATION_MS = 3000; // From JavaScript.html


  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.levelUpSubscription = this.skillService.levelUp$.subscribe(info => {
      if (info.isMaxLevel) {
        this.triggerCelebration(info);
      }
    });
  }

  ngOnDestroy(): void {
    this.levelUpSubscription?.unsubscribe();
    clearTimeout(this.celebrationTimeout);
  }

  triggerCelebration(info: LevelUpInfo): void {
     const skill = this.skillService.getSkill(info.skillIndex);
     if (skill) {
       console.log(`*** ${skill.name} reached Level 99! Triggering celebration.`);
       this.celebrationSkill = skill;
       this.showCelebration = true;

       // Clear any existing timeout before setting a new one
       clearTimeout(this.celebrationTimeout);

       this.celebrationTimeout = setTimeout(() => {
         this.showCelebration = false;
         this.celebrationSkill = null;
          console.log('Hiding celebration overlay.');
       }, this.MAX_LEVEL_CELEBRATION_DURATION_MS);
     }
  }
}