import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsCheck } from './news-check';

describe('NewsCheck', () => {
  let component: NewsCheck;
  let fixture: ComponentFixture<NewsCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
