import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetProgressComponent } from './reset-progress.component';

describe('ResetProgressComponent', () => {
  let component: ResetProgressComponent;
  let fixture: ComponentFixture<ResetProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
