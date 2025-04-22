import { Component, OnDestroy, OnInit } from '@angular/core';
import { SkillService, XpGainInfo } from '../skill.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

interface XpPopup extends XpGainInfo {
  id: number;
  top: number;
  left: number;
}

@Component({
  selector: 'app-orb',
  standalone: true,
  imports: [],
  templateUrl: './orb.component.html',
  styleUrls: ['./orb.component.css'],
  animations: [
    trigger('floatUpFadeOut', [
      state('visible', style({ opacity: 1, transform: 'translate(-50%, 0)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, 20px)' }),
        animate('1.5s ease-out')
      ]),
      transition(':leave', [
        animate('1.5s ease-out', style({ opacity: 0, transform: 'translate(-50%, -50px)' }))
      ])
    ])
  ]
})
export class OrbComponent implements OnInit, OnDestroy {
  xpPopups: XpPopup[] = [];
  private popupIdCounter = 0;
  private xpGainSubscription: Subscription | null = null;

  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.xpGainSubscription = this.skillService.xpGain$.subscribe(info => {
      this.showXpGain(info);
    });
  }

  ngOnDestroy(): void {
     this.xpGainSubscription?.unsubscribe();
  }

  onOrbClick(): void {
    this.skillService.gainExperience();
  }

  showXpGain(info: XpGainInfo): void {
    const newPopup: XpPopup = {
      ...info,
      id: this.popupIdCounter++,
      top: 0,
      left: 50
    };
    this.xpPopups.push(newPopup);

    setTimeout(() => {
      this.removePopup(newPopup.id);
    }, 1500);
  }

  removePopup(id: number): void {
    const index = this.xpPopups.findIndex(p => p.id === id);
    if (index !== -1) {
        this.xpPopups.splice(index, 1);
    }
  }

  trackPopupById(index: number, popup: XpPopup): number {
      return popup.id;
  }
}