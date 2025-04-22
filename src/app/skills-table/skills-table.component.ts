import { Component, OnInit, OnDestroy } from '@angular/core';
import { SkillService, Skill, LevelUpInfo } from '../skill.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-skills-table',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './skills-table.component.html',
  styleUrls: ['./skills-table.component.css']
})
export class SkillsTableComponent implements OnInit, OnDestroy {
  skills: Skill[] = [];
  totalLevel: number = 0;
  totalXp: number = 0;

  highlightedSkillIndex: number | null = null;
  levelUpSkillIndex: number | null = null;

  private skillsSubscription: Subscription | null = null;
  private highlightSubscription: Subscription | null = null;
  private levelUpSubscription: Subscription | null = null;

  private readonly HIGHLIGHT_DURATION_MS = 500;
  private readonly LEVEL_UP_FLASH_DURATION_MS = 700;


  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.skillsSubscription = this.skillService.skills$.subscribe(skills => {
      this.skills = skills;
      this.updateTotals();
    });

    this.highlightSubscription = this.skillService.skillHighlight$.subscribe(index => {
       this.triggerHighlight(index);
    });

     this.levelUpSubscription = this.skillService.levelUp$.subscribe(info => {
       this.triggerLevelUpFlash(info.skillIndex);
       this.updateTotals();
    });

    this.skills = this.skillService.getSkills();
    this.updateTotals();
  }

  ngOnDestroy(): void {
    this.skillsSubscription?.unsubscribe();
    this.highlightSubscription?.unsubscribe();
    this.levelUpSubscription?.unsubscribe();
  }

  updateTotals(): void {
    this.totalLevel = this.skills.reduce((sum, skill) => sum + skill.level, 0);
    this.totalXp = this.skills.reduce((sum, skill) => sum + skill.xp, 0);
  }

   triggerHighlight(index: number): void {
    this.highlightedSkillIndex = index;
    setTimeout(() => {
        if (this.highlightedSkillIndex === index) {
            this.highlightedSkillIndex = null;
        }
    }, this.HIGHLIGHT_DURATION_MS);
   }

   triggerLevelUpFlash(index: number): void {
        this.levelUpSkillIndex = index;
        setTimeout(() => {
             if (this.levelUpSkillIndex === index) {
                this.levelUpSkillIndex = null;
             }
        }, this.LEVEL_UP_FLASH_DURATION_MS);
   }

   getSkillRowClasses(skill: Skill, index: number): object {
       return {
           'highlight': this.highlightedSkillIndex === index,
           'level-up-flash': this.levelUpSkillIndex === index,
           'level-99-outline': skill.level === 99 && skill.xp < 200000000,
           'max-xp-outline': skill.xp >= 200000000
       };
   }

   formatXp(xp: number): string {
       return xp.toLocaleString();
   }

   trackSkillByName(index: number, skill: Skill): string {
       return skill.name;
   }
}