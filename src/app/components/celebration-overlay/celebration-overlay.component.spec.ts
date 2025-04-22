import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebrationOverlayComponent } from './celebration-overlay.component';

describe('CelebrationOverlayComponent', () => {
  let component: CelebrationOverlayComponent;
  let fixture: ComponentFixture<CelebrationOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CelebrationOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CelebrationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
