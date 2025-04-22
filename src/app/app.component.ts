import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrbComponent } from './components/orb/orb.component';
import { SkillsListComponent } from './components/skills-list/skills-list.component';
import { CelebrationOverlayComponent } from './components/celebration-overlay/celebration-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    OrbComponent,
    SkillsListComponent,
    CelebrationOverlayComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'rune-clicker-game';
}