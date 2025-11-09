import { TestBed } from '@angular/core/testing';

import { NewsFilter } from './news-filter';

describe('NewsFilter', () => {
  let service: NewsFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
