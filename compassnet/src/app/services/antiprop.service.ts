import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PropagandaResponse {
  input_text: string;
  propaganda: string;
  analysis: string;
  keywords: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AntipropService {

  private apiUrl = 'http://127.0.0.1:8100/analyze';

  constructor(private http: HttpClient) {}

  analyze(text: string): Observable<PropagandaResponse> {
    return this.http.post<PropagandaResponse>(this.apiUrl, { text });
  }
}
