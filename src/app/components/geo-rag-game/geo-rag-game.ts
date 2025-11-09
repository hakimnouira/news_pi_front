import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  GeoRagGameService,
  NewGameRequest,
  SceneResponse,
  ConsequenceResponse,
  StatusResponse,
  RealityResponse,
  NewsEvent
} from '../../services/georaggame.service';

@Component({
  selector: 'app-geo-rag-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './geo-rag-game.html',
  styleUrls: ['./geo-rag-game.scss'],
})
export class GeoRagGame implements OnInit {
  private api = inject(GeoRagGameService);
  private sanitizer = inject(DomSanitizer);

  // ---------- Role mapping ----------
  roleIds = ['head_of_government', 'diplomat', 'military_commander', 'economic_advisor'];
  roleOptions: Record<string,string> = {
    head_of_government: 'Head of Government',
    diplomat: 'Senior Diplomat',
    military_commander: 'Military Commander',
    economic_advisor: 'Economic Advisor',
  };

  rolesMap: any = {
    head_of_government: {
      name: 'Head of Government',
      profile: 'United States President focused on stability and rule-of-law.',
      objectives: [
        'Safeguard national stability and security',
        'Advance national economic interests',
        'Uphold alliances and international law',
      ],
      constraints: [
        'Domestic politics and public opinion',
        'Budgetary and legal limits',
        'Alliance commitments and escalation risks',
      ],
      tools: [
        'diplomatic demarches/statements',
        'targeted sanctions/export controls',
        'security assistance/intelligence sharing',
        'visa restrictions/Magnitsky designations',
        'trade incentives/development aid conditionality',
        'force posture adjustments (overflights/naval presence)',
        'multilateral action (UN/NATO/G7/Quad)',
        'backchannel mediation/special envoy',
      ],
    },
    diplomat: {
      name: 'Senior Diplomat',
      profile: 'Career diplomat focused on peaceful conflict resolution and international cooperation.',
      objectives: [
        'Promote diplomatic solutions to conflicts',
        'Build and maintain international partnerships',
        'Protect national interests through negotiation',
      ],
      constraints: [
        'Diplomatic protocols and conventions',
        'Limited direct authority',
        'Need for multilateral consensus',
      ],
      tools: [
        'formal diplomatic notes/protests',
        'bilateral and multilateral negotiations',
        'consular services and protections',
        'cultural exchange programs',
        'diplomatic immunity provisions',
        'embassy/mission statements',
        'international organization channels',
        'track-two diplomacy initiatives',
      ],
    },
    military_commander: {
      name: 'Military Commander',
      profile: 'Senior military leader focused on deterrence and operational readiness.',
      objectives: [
        'Maintain military readiness and capability',
        'Protect national security interests',
        'Support allied military cooperation',
      ],
      constraints: [
        'Rules of engagement (ROE)',
        'Command structure hierarchy',
        'International military law',
        'Force protection requirements',
      ],
      tools: [
        'military exercises and drills',
        'intelligence/surveillance operations',
        'force deployments and positioning',
        'military-to-military engagement',
        'defense cooperation programs',
        'strategic deterrence operations',
        'humanitarian assistance/disaster relief',
        'joint training missions',
      ],
    },
    economic_advisor: {
      name: 'Economic Advisor',
      profile: 'Chief economic advisor focused on financial stability and growth.',
      objectives: [
        'Maintain economic stability',
        'Promote sustainable growth',
        'Strengthen international trade',
      ],
      constraints: [
        'Market reaction sensitivity',
        'International financial regulations',
        'Monetary policy independence',
      ],
      tools: [
        'trade policy adjustments',
        'economic sanctions coordination',
        'financial market interventions',
        'development aid programs',
        'trade agreement negotiations',
        'foreign investment reviews',
        'economic partnership initiatives',
        'financial system safeguards',
      ],
    },
  };

  // ---------- UI state ----------
  roleId = 'head_of_government';
  get selectedRole() { return this.rolesMap[this.roleId]; }

  autoAdvance = true;
  showXai = true;
  loading = false;

  sessionId: string | null = null;
  events: NewsEvent[] = [];
  selectedEventIndex = 0;
  get selectedEventUrl(): string | null {
    const ev = this.events[this.selectedEventIndex];
    return ev?.url ?? null;
  }

  scene: SceneResponse | null = null;
  consequence: ConsequenceResponse | null = null;

  metrics: Record<string, number> = {};
  prevMetrics: Record<string, number> = {
    Stability: 0, Economy: 0, Influence: 0, Military: 0, Environment: 0,
  };
  metricKeys = ['Stability','Economy','Influence','Military','Environment'];

  statusTurn: number | null = null;
  prevSummary: string | null = null;
  ended = false;

  realityHeadlines: RealityResponse['headlines'] = [];

  // (optional) image error flags; not used for UI branching now
  sceneImgError = false;
  choiceImgError = false;

  ngOnInit(): void {
    this.api.health().subscribe();
  }

  // ---------- Image helpers ----------
  // Prefer server URL, otherwise fallback to base64 (legacy)
  private sceneImageValue(): string | null {
    return this.scene?.scene_image_url || this.scene?.scene_image || null;
  }
  private choiceImageValue(): string | null {
    return this.consequence?.choice_image_url || this.consequence?.choice_image || null;
  }

  /** Single source of truth for image card: choice image if present, else scene image */
  latestImageValue(): string | null {
    return this.choiceImageValue() || this.sceneImageValue();
  }

  imageSrc(img?: string | null): SafeResourceUrl | null {
    if (!img) return null;
    const raw = ('' + img).trim();
    if (!raw || raw.toLowerCase() === 'none' || raw.toLowerCase() === 'null') return null;

    const url = /^https?:\/\//i.test(raw)
      ? raw
      : /^data:image\//i.test(raw)
        ? raw
        : `data:image/png;base64,${raw}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  reloadLatestImage() {
    // trigger Angular change detection without refetching
    if (this.consequence) {
      this.consequence = { ...this.consequence };
    } else if (this.scene) {
      this.scene = { ...this.scene };
    }
  }

  onImgError(which: 'scene' | 'choice' | 'latest') {
    if (which === 'scene') this.sceneImgError = true;
    if (which === 'choice') this.choiceImgError = true;
  }

  // ---------- Text parsers ----------
  extractBrief(text: string): string {
    const m = /Brief Narrative\s*:\s*([\s\S]+?)(?:\n\s*Key Reactions:|\n\s*Decision Options:|$)/i.exec(text || '');
    return m ? m[1].trim() : (text || '');
  }

  parseOptions(text: string): { [k: string]: string } {
    const out: any = {};
    const blockMatch = /Decision Options\s*:\s*([\s\S]+)$/i.exec(text || '');
    const block = blockMatch ? blockMatch[1] : (text || '');
    const rx = /^\s*(\d)\.\s*([\s\S]*?)(?=^\s*\d\.\s*|$)/gmi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(block)) !== null) out[m[1]] = m[2].trim().replace(/\n+/g, ' ');
    return out;
  }

  extractWhyOptions(text: string): string[] {
    const m = /Why These Options Matter\s*:\s*([\s\S]+)$/i.exec(text || '');
    if (!m) return [];
    return (m[1].match(/^[\s\-\u2022\*]+(.+)$/gm) || [])
      .map(b => b.replace(/^[\s\-\u2022\*]+/, '').trim());
  }

  extractMetricRationales(text: string): Record<string, string> {
    const out: any = {};
    this.metricKeys.forEach(k => {
      const m = new RegExp(String.raw`^${k}\s*:\s*(.+)$`, 'gmi').exec(text || '');
      if (m) out[k] = m[1].trim();
    });
    return out;
  }

  deltaOf(k: string): number {
    const curr = this.metrics?.[k] ?? 0;
    const prev = this.prevMetrics?.[k] ?? 0;
    return +(curr - prev).toFixed(2);
  }

  private syncPrev(curr: Record<string, number>) {
    this.metricKeys.forEach(k => {
      if (curr[k] === undefined || curr[k] === null) curr[k] = 0;
      this.prevMetrics[k] = curr[k];
    });
    this.metrics = { ...curr };
  }

  // ---------- Actions ----------
  onRoleChanged() {}

  startNewGame() {
    const req: NewGameRequest = {
      role_id: this.roleId,
      refresh_index: true,
      min_depth: 5,
      max_depth: 6,
      hard_cap: 9,
    };

    this.loading = true;
    this.api.newGame(req).subscribe({
      next: r => {
        this.sessionId = r.session_id;
        this.events = r.events || [];
        this.selectedEventIndex = 0;

        // reset turn state
        this.scene = null;
        this.consequence = null;
        this.sceneImgError = false;
        this.choiceImgError = false;

        this.metrics = {};
        this.syncPrev({ Stability:0, Economy:0, Influence:0, Military:0, Environment:0 });
        this.statusTurn = null;
        this.prevSummary = null;
        this.ended = false;
      },
      error: e => console.error(e),
      complete: () => this.loading = false
    });
  }

  startSelectedTurn() {
    if (!this.sessionId) return;
    const payload: any = { session_id: this.sessionId };
    const url = this.selectedEventUrl;
    if (url) payload.event_url = url;

    this.loading = true;
    this.sceneImgError = false;
    this.api.start(payload).subscribe({
      next: r => {
        this.scene = r;
        this.consequence = null;              // ensures latest image falls back to scene image
        const newMetrics = r.metrics || {};
        this.prevMetrics = { ...this.metrics };
        this.metrics = { ...newMetrics };
        this.ended = !!r.ended;
        this.refreshStatus();
      },
      error: e => console.error(e),
      complete: () => this.loading = false
    });
  }

  nextTurn() {
    if (!this.sessionId) return;
    this.loading = true;
    this.sceneImgError = false;
    this.api.start({ session_id: this.sessionId }).subscribe({
      next: r => {
        this.scene = r;
        this.consequence = null;              // show only the new scene image
        const newMetrics = r.metrics || {};
        this.prevMetrics = { ...this.metrics };
        this.metrics = { ...newMetrics };
        this.ended = !!r.ended;
        this.refreshStatus();
      },
      complete: () => this.loading = false
    });
  }

  chooseOption(option: number) {
    if (!this.sessionId) return;
    this.loading = true;
    this.choiceImgError = false;
    this.api.choose({ session_id: this.sessionId, choice: option }).subscribe({
      next: r => {
        this.consequence = r;                 // latest image becomes choice image
        const newMetrics = r.metrics || {};
        this.prevMetrics = { ...this.metrics };
        this.metrics = { ...newMetrics };
        this.ended = !!r.ended;

        if (this.autoAdvance && !this.ended) {
          this.startSelectedTurn();
        } else {
          this.refreshStatus();
          this.loading = false;
        }
      },
      error: e => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  fetchReality() {
    if (!this.sessionId) return;
    this.api.reality(this.sessionId).subscribe({
      next: r => this.realityHeadlines = r.headlines || []
    });
  }

  private refreshStatus() {
    if (!this.sessionId) return;
    this.api.status(this.sessionId).subscribe({
      next: (s: StatusResponse) => {
        this.statusTurn = s.turn;
        this.prevSummary = s.prev_summary || null;
        this.ended = !!s.ended;
        this.metrics = s.metrics || this.metrics;
      }
    });
  }
}
