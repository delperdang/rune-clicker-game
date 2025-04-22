import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Skill {
  name: string;
  icon: string;
  xp: number;
  level: number;
}

export interface XpGainInfo {
    skillName: string;
    xpGained: number;
}

export interface LevelUpInfo {
    skillIndex: number;
    newLevel: number;
    isMaxLevel: boolean; // If level 99 was reached
    isMaxXp: boolean;   // If 200M XP was reached
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly SKILL_DATA_KEY = 'RuneClicker_SkillData_Angular_v1';
  private readonly MAX_LEVEL = 99;
  private readonly MAX_XP = 200000000;
  private readonly TARGET_CLICKS_PER_LEVEL = 3.0;
  private readonly XP_GAIN_RANDOMNESS_FACTOR_MIN = 0.6;
  private readonly XP_GAIN_RANDOMNESS_FACTOR_MAX = 3.0;

  private readonly xpForLevel: number[] = [
    0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411,
    2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824,
    12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648,
    37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333,
    111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742,
    302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627,
    814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808,
    1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776,
    4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629,
    11805606, 13034431
  ]; // From Code.js

  private readonly defaultSkillData: Skill[] = [
    { name: 'Attack', icon: 'https://runescape.wiki/images/thumb/Attack-icon.png/21px-Attack-icon.png', xp: 0, level: 1 },
    { name: 'Defense', icon: 'https://runescape.wiki/images/thumb/Defence-icon.png/21px-Defence-icon.png', xp: 0, level: 1 },
    { name: 'Strength', icon: 'https://runescape.wiki/images/thumb/Strength-icon.png/21px-Strength-icon.png', xp: 0, level: 1 },
    { name: 'Constitution', icon: 'https://runescape.wiki/images/thumb/Constitution-icon.png/21px-Constitution-icon.png', xp: 0, level: 1 },
    { name: 'Ranged', icon: 'https://runescape.wiki/images/thumb/Ranged-icon.png/21px-Ranged-icon.png', xp: 0, level: 1 },
    { name: 'Prayer', icon: 'https://runescape.wiki/images/thumb/Prayer-icon.png/21px-Prayer-icon.png', xp: 0, level: 1 },
    { name: 'Magic', icon: 'https://runescape.wiki/images/thumb/Magic-icon.png/21px-Magic-icon.png', xp: 0, level: 1 },
    { name: 'Cooking', icon: 'https://runescape.wiki/images/thumb/Cooking-icon.png/21px-Cooking-icon.png', xp: 0, level: 1 },
    { name: 'Woodcutting', icon: 'https://runescape.wiki/images/thumb/Woodcutting-icon.png/21px-Woodcutting-icon.png', xp: 0, level: 1 },
    { name: 'Fletching', icon: 'https://runescape.wiki/images/thumb/Fletching-icon.png/21px-Fletching-icon.png', xp: 0, level: 1 },
    { name: 'Fishing', icon: 'https://runescape.wiki/images/thumb/Fishing-icon.png/21px-Fishing-icon.png', xp: 0, level: 1 },
    { name: 'Firemaking', icon: 'https://runescape.wiki/images/thumb/Firemaking-icon.png/21px-Firemaking-icon.png', xp: 0, level: 1 },
    { name: 'Crafting', icon: 'https://runescape.wiki/images/thumb/Crafting-icon.png/21px-Crafting-icon.png', xp: 0, level: 1 },
    { name: 'Smithing', icon: 'https://runescape.wiki/images/thumb/Smithing-icon.png/21px-Smithing-icon.png', xp: 0, level: 1 },
    { name: 'Mining', icon: 'https://runescape.wiki/images/thumb/Mining-icon.png/21px-Mining-icon.png', xp: 0, level: 1 },
    { name: 'Herblore', icon: 'https://runescape.wiki/images/thumb/Herblore-icon.png/21px-Herblore-icon.png', xp: 0, level: 1 },
    { name: 'Agility', icon: 'https://runescape.wiki/images/thumb/Agility-icon.png/21px-Agility-icon.png', xp: 0, level: 1 },
    { name: 'Thieving', icon: 'https://runescape.wiki/images/thumb/Thieving-icon.png/21px-Thieving-icon.png', xp: 0, level: 1 }
  ]; // From Code.js

  private skills: Skill[] = [];
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  skills$ = this.skillsSubject.asObservable();

  // Subjects to notify components of events
  private xpGainSubject = new Subject<XpGainInfo>();
  xpGain$ = this.xpGainSubject.asObservable();

  private levelUpSubject = new Subject<LevelUpInfo>();
  levelUp$ = this.levelUpSubject.asObservable();

  private skillHighlightSubject = new Subject<number>(); // Emits skill index
  skillHighlight$ = this.skillHighlightSubject.asObservable();

  constructor() {
    this.loadSkills();
  }

  private loadSkills(): void {
    try {
      const savedData = localStorage.getItem(this.SKILL_DATA_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Skill[];
        // Basic validation
        if (Array.isArray(parsedData) && parsedData.length === this.defaultSkillData.length && parsedData[0]?.name) {
          this.skills = parsedData;
          console.log('Loaded saved skill data.');
        } else {
          throw new Error('Invalid saved data format.');
        }
      } else {
        this.resetSkillsToDefault();
        console.log('No saved data found. Using default skills.');
      }
    } catch (error) {
      console.error('Error loading or parsing skill data:', error);
      this.resetSkillsToDefault();
      this.saveSkills(); // Save defaults if loading failed
    }
    this.skillsSubject.next([...this.skills]); // Emit initial data
  }

  private saveSkills(): void {
    try {
      localStorage.setItem(this.SKILL_DATA_KEY, JSON.stringify(this.skills));
       console.log('Skills saved to localStorage.');
    } catch (error) {
      console.error('Error saving skill data:', error);
    }
  }

  private calculateLevel(xp: number): number {
    if (xp >= this.xpForLevel[this.MAX_LEVEL - 1]) return this.MAX_LEVEL;
    for (let i = this.MAX_LEVEL - 2; i >= 0; i--) {
      if (xp >= this.xpForLevel[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  gainExperience(): void {
    if (this.skills.length === 0) return;

    const randomSkillIndex = Math.floor(Math.random() * this.skills.length);
    const targetSkill = this.skills[randomSkillIndex];
    const oldLevel = targetSkill.level;

    if (targetSkill.xp >= this.MAX_XP) {
      console.log(`${targetSkill.name} is maxed. Skipping XP gain.`);
      this.xpGainSubject.next({ skillName: targetSkill.name, xpGained: 0 });
      this.skillHighlightSubject.next(randomSkillIndex); // Highlight even if maxed
      return;
    }

    let xpGained = 0;
    const currentLevel = targetSkill.level;
    const calculationLevelIndex = (currentLevel === this.MAX_LEVEL) ? (this.MAX_LEVEL - 1) : currentLevel;
    const xpAtCalculationLevel = (calculationLevelIndex > 0) ? this.xpForLevel[calculationLevelIndex - 1] : 0;
    const xpForNextLevel = this.xpForLevel[calculationLevelIndex]; // Index is level-1
    const xpDifferenceForLevel = xpForNextLevel - xpAtCalculationLevel;
    const targetAverageXpGain = xpDifferenceForLevel / this.TARGET_CLICKS_PER_LEVEL;
    const minGain = Math.max(1, Math.floor(targetAverageXpGain * this.XP_GAIN_RANDOMNESS_FACTOR_MIN));
    const maxGain = Math.max(minGain + 1, Math.ceil(targetAverageXpGain * this.XP_GAIN_RANDOMNESS_FACTOR_MAX));
    xpGained = Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain;

    targetSkill.xp += xpGained;
    let capped = false;
    if (targetSkill.xp > this.MAX_XP) {
        xpGained -= (targetSkill.xp - this.MAX_XP); // Adjust displayed gain if capped
        targetSkill.xp = this.MAX_XP;
        capped = true;
    }

    const newLevel = this.calculateLevel(targetSkill.xp);
    let leveledUp = false;
    let isMaxLevel = false;

    if (newLevel > oldLevel) {
        targetSkill.level = newLevel;
        leveledUp = true;
        isMaxLevel = newLevel === this.MAX_LEVEL;
        console.log(`${targetSkill.name} leveled up to ${newLevel}!`);
    }

    this.xpGainSubject.next({ skillName: targetSkill.name, xpGained: xpGained });
    this.skillHighlightSubject.next(randomSkillIndex);

    if (leveledUp || capped) {
        this.levelUpSubject.next({
            skillIndex: randomSkillIndex,
            newLevel: newLevel,
            isMaxLevel: isMaxLevel,
            isMaxXp: capped // Notify if max XP was reached
        });
    }

    this.skills[randomSkillIndex] = { ...targetSkill };
    this.skillsSubject.next([...this.skills]); // Emit updated array

    this.saveSkills(); // Save after every gain
  }

  resetSkills(): void {
      this.resetSkillsToDefault();
      this.skillsSubject.next([...this.skills]); // Emit reset data
      this.saveSkills();
      console.log("Skills reset to default.");
  }

  private resetSkillsToDefault(): void {
     this.skills = JSON.parse(JSON.stringify(this.defaultSkillData));
  }

  getSkills(): Skill[] {
    return [...this.skills]; // Return a copy
  }

  getSkill(index: number): Skill | undefined {
      return this.skills[index] ? { ...this.skills[index] } : undefined;
  }
}