import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Skill } from './skill.model';
import { XP_FOR_LEVEL, MAX_LEVEL, MAX_XP } from './xp-table.const';

const TARGET_CLICKS_PER_LEVEL = 3.0;
const XP_GAIN_RANDOMNESS_FACTOR_MIN = 0.6;
const XP_GAIN_RANDOMNESS_FACTOR_MAX = 3.0;
const SAVE_DEBOUNCE_MS = 2000;
const SKILL_DATA_KEY = 'RuneClicker_SkillData_Angular_v1'; // localStorage key

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  private _skills = new BehaviorSubject<Skill[]>([]);
  private _totalLevel = new BehaviorSubject<number>(0);
  private _totalXp = new BehaviorSubject<number>(0);
  private _skillLeveledUp = new BehaviorSubject<{ skillIndex: number; newLevel: number } | null>(null);
  private _skillReachedMaxLevel = new BehaviorSubject<Skill | null>(null);
  private _xpGained = new BehaviorSubject<{ skillName: string; xpAmount: number } | null>(null);

  readonly skills$ = this._skills.asObservable();
  readonly totalLevel$ = this._totalLevel.asObservable();
  readonly totalXp$ = this._totalXp.asObservable();
  readonly skillLeveledUp$ = this._skillLeveledUp.asObservable();
  readonly skillReachedMaxLevel$ = this._skillReachedMaxLevel.asObservable();
  readonly xpGained$ = this._xpGained.asObservable();

  private defaultSkills: Skill[] = [
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
  ];

  private saveTimeout: ReturnType<typeof setTimeout> | null = null; // For debouncing save calls

  constructor() {
    this.loadSkills(); // Load data when service is initialized
  }

  private calculateLevel(xp: number): number {
    if (xp >= XP_FOR_LEVEL[MAX_LEVEL - 1]) return MAX_LEVEL;
    for (let i = MAX_LEVEL - 2; i >= 0; i--) {
      if (xp >= XP_FOR_LEVEL[i]) {
        return i + 1; // Level is index + 1
      }
    }
    return 1; // Default to level 1
  }

  private updateTotals(skills: Skill[]): void {
    const totalLevel = skills.reduce((sum, skill) => sum + skill.level, 0);
    const totalXp = skills.reduce((sum, skill) => sum + skill.xp, 0);
    this._totalLevel.next(totalLevel);
    this._totalXp.next(totalXp);
  }

  private saveSkills(skills: Skill[]): void {
    try {
      const dataToSave = skills.map(({ name, icon, xp, level }) => ({ name, icon, xp, level }));
      localStorage.setItem(SKILL_DATA_KEY, JSON.stringify(dataToSave));
      console.log("Progress saved to localStorage.");
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }

  private triggerSave(skills: Skill[]): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSkills(skills);
    }, SAVE_DEBOUNCE_MS);
  }

  loadSkills(): void {
    let loadedSkills: Skill[] = [];
    try {
      const savedData = localStorage.getItem(SKILL_DATA_KEY);
      if (savedData) {
        const parsedData: Omit<Skill, 'isLevel99' | 'isMaxXp' | 'levelUpFlash'>[] = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length === this.defaultSkills.length) {
           loadedSkills = parsedData.map(s => {
             const level = this.calculateLevel(s.xp);
             const isMaxXp = s.xp >= MAX_XP;
             const isLevel99 = level === MAX_LEVEL && !isMaxXp;
             return {
               ...s,
               level: level,
               isLevel99: isLevel99,
               isMaxXp: isMaxXp
             };
           });
           console.log("Loaded progress from localStorage.");
        } else {
           throw new Error("Invalid data format in localStorage."); // Trigger default load
        }
      } else {
        loadedSkills = JSON.parse(JSON.stringify(this.defaultSkills)); // Deep copy
        console.log("No saved data found. Using default skills.");
         loadedSkills.forEach(s => {
             s.isLevel99 = false;
             s.isMaxXp = false;
         });
      }
    } catch (error) {
      console.error("Error loading/parsing saved data, using defaults:", error);
      loadedSkills = JSON.parse(JSON.stringify(this.defaultSkills)); // Use default on error
      loadedSkills.forEach(s => { // Set initial outline state
            s.isLevel99 = false;
            s.isMaxXp = false;
        });
      this.saveSkills(loadedSkills); // Attempt to save the defaults if loading failed
    }
    this._skills.next(loadedSkills); // Emit the loaded/default skills
    this.updateTotals(loadedSkills); // Update totals based on loaded data
  }

  resetSkills(): void {
    console.log("Resetting skills to default.");
    const newSkills = JSON.parse(JSON.stringify(this.defaultSkills));
    newSkills.forEach((s: Skill) => {
        s.isLevel99 = false;
        s.isMaxXp = false;
    });
    this._skills.next(newSkills);
    this.updateTotals(newSkills);
    this.saveSkills(newSkills); // Save immediately on reset
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }
  }

  addXpToRandomSkill(): void {
    const currentSkills = [...this._skills.value]; // Create a mutable copy
    if (currentSkills.length === 0) return; // Safety check

    const randomIndex = Math.floor(Math.random() * currentSkills.length);
    const targetSkill = currentSkills[randomIndex];
    const oldLevel = targetSkill.level;

    if (targetSkill.xp >= MAX_XP) {
        console.log(`${targetSkill.name} is already maxed. Skipping XP gain.`);
        this._xpGained.next({ skillName: targetSkill.name, xpAmount: 0 }); // Emit 0 XP gain event
        return; // Exit if maxed
    }

    let xpGained = 0;
    const currentLevel = targetSkill.level;
    const calculationLevelIndex = (currentLevel === MAX_LEVEL) ? (MAX_LEVEL - 1) : currentLevel;
    const xpAtCalculationLevel = (calculationLevelIndex > 0) ? XP_FOR_LEVEL[calculationLevelIndex - 1] : 0;
    const xpForNextLevel = XP_FOR_LEVEL[calculationLevelIndex];
    const xpDifferenceForLevel = xpForNextLevel - xpAtCalculationLevel;
    const targetAverageXpGain = Math.max(1, xpDifferenceForLevel / TARGET_CLICKS_PER_LEVEL); // Ensure target is at least 1
    const minGain = Math.max(1, Math.floor(targetAverageXpGain * XP_GAIN_RANDOMNESS_FACTOR_MIN));
    const maxGain = Math.max(minGain + 1, Math.ceil(targetAverageXpGain * XP_GAIN_RANDOMNESS_FACTOR_MAX)); // Ensure max > min
    xpGained = Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain;

    targetSkill.xp += xpGained;

    let capped = false;
    if (targetSkill.xp >= MAX_XP) {
        targetSkill.xp = MAX_XP;
        capped = true;
        console.log(`${targetSkill.name} XP CAPPED at ${MAX_XP.toLocaleString()}.`);
    }

    const newLevel = this.calculateLevel(targetSkill.xp);

    if (newLevel > oldLevel) {
        targetSkill.level = newLevel;
        console.log(`${targetSkill.name} leveled up to ${newLevel}!`);
        this._skillLeveledUp.next({ skillIndex: randomIndex, newLevel: newLevel });

        if (newLevel === MAX_LEVEL && !capped) {
             console.log(`*** ${targetSkill.name} reached Level 99! ***`);
             this._skillReachedMaxLevel.next({ ...targetSkill }); // Send a copy
        }
    }

    targetSkill.isMaxXp = capped;
    targetSkill.isLevel99 = targetSkill.level === MAX_LEVEL && !capped;

    this._xpGained.next({ skillName: targetSkill.name, xpAmount: xpGained });

    this._skills.next(currentSkills);
    this.updateTotals(currentSkills);
    this.triggerSave(currentSkills);
  }
}