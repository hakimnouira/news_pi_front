import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoRagGame } from './geo-rag-game';

describe('GeoRagGame', () => {
  let component: GeoRagGame;
  let fixture: ComponentFixture<GeoRagGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoRagGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoRagGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
