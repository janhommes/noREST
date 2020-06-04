import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeDialogComponent } from './realtime-dialog.component';

describe('RealtimeDialogComponent', () => {
  let component: RealtimeDialogComponent;
  let fixture: ComponentFixture<RealtimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
