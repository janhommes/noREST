import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentListComponent } from './fragment-list.component';

describe('FragmentListComponent', () => {
  let component: FragmentListComponent;
  let fixture: ComponentFixture<FragmentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FragmentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FragmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
