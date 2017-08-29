import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PushMessageComponent } from './push-message.component';

describe('PushMessageComponent', () => {
  let component: PushMessageComponent;
  let fixture: ComponentFixture<PushMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
