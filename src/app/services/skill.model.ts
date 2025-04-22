export interface Skill {
    name: string;
    icon: string;
    xp: number;
    level: number;
    highlighted?: boolean; // Example if you wanted a sticky highlight
    levelUpFlash?: boolean; // Used by skills-list component
    isLevel99?: boolean;   // Used for outline class
    isMaxXp?: boolean;     // Used for outline class
  }