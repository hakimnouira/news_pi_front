import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** ---- API models (mirrors FastAPI routes) ---- */

export interface NewsEvent {
  title: string;
  url?: string;
  source_name?: string;
  published_at?: string;
  [k: string]: any;
}

export interface NewGameRequest {
  role_id?: string;
  topics?: string[];
  refresh_index?: boolean;
  min_depth?: number;
  max_depth?: number;
  hard_cap?: number;
}

export interface NewGameResponse {
  session_id: string;
  events: NewsEvent[];
}

export interface StartEventRequest {
  session_id: string;
  event_url?: string;
  event_title?: string;
}

export interface SceneResponse {
  session_id: string;
  turn: number;
  scene_text: string;
  scene_image?: string | null;       // base64 (legacy)
  scene_image_url?: string | null;   // HTTP URL (preferred)
  metrics: Record<string, number>;
  turns_left: number;
  ended: boolean;
}

export interface ChoiceRequest {
  session_id: string;
  choice: number; // 1..4
}

export interface ConsequenceResponse {
  session_id: string;
  turn: number;
  consequence_text: string;
  choice_image?: string | null;      // base64 (legacy)
  choice_image_url?: string | null;  // HTTP URL (preferred)
  metrics: Record<string, number>;
  turns_left: number;
  ended: boolean;
}

export interface StatusResponse {
  session_id: string;
  turn: number;
  metrics: Record<string, number>;
  prev_summary?: string;
  event?: NewsEvent;
  turns_left: number;
  ended: boolean;
}

export interface RealityHeadline {
  title: string;
  url: string;
  source_name?: string;
  published_at?: string;
}

export interface RealityResponse {
  session_id: string;
  headlines: RealityHeadline[];
}

/** ---- Service ---- */

@Injectable({ providedIn: 'root' })
export class GeoRagGameService {
  private base = 'http://127.0.0.1:8005';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string | null | undefined) {
    if (!url) return;
    this.base = url.replace(/\/+$/, '');
  }

  get baseUrl() {
    return this.base;
  }

  /** GET /game/health */
  health(): Observable<{ ok: boolean }> {
    return this.http.get<{ ok: boolean }>(`${this.base}/game/health`);
  }

  /** POST /game/new */
  newGame(body: NewGameRequest): Observable<NewGameResponse> {
    return this.http.post<NewGameResponse>(`${this.base}/game/new`, body);
  }

  /** POST /game/start */
  start(req: StartEventRequest): Observable<SceneResponse> {
    return this.http.post<SceneResponse>(`${this.base}/game/start`, req);
  }

  /** POST /game/choose */
  choose(req: ChoiceRequest): Observable<ConsequenceResponse> {
    return this.http.post<ConsequenceResponse>(`${this.base}/game/choose`, req);
  }

  /** GET /game/status/{session_id} */
  status(sessionId: string): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.base}/game/status/${sessionId}`);
  }

  /** GET /game/reality/{session_id} */
  reality(sessionId: string): Observable<RealityResponse> {
    return this.http.get<RealityResponse>(`${this.base}/game/reality/${sessionId}`);
  }
}
