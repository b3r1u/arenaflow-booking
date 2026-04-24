import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaService } from '../../services/arena.service';
import { Arena, SportType } from '../../models/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .arena-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px) {
      .arena-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .arena-grid { grid-template-columns: repeat(3, 1fr); }
    }

    .arena-card {
      border-radius: 1.25rem;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      background: var(--card);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    .arena-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.13);
    }
    .arena-card:active { transform: translateY(-1px); }

    .card-banner {
      height: 100px;
      position: relative;
      flex-shrink: 0;
    }
    .card-banner-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      filter: blur(5px) brightness(0.8) saturate(1.3);
      transform: scale(1.1);
    }
    .card-banner-deco {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 3.5rem;
      opacity: 0.22;
      color: white;
      pointer-events: none;
      line-height: 1;
    }
    .card-avatar-wrap {
      position: absolute;
      bottom: -1.25rem;
      left: 1rem;
      z-index: 2;
    }
    .card-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      color: white;
      border: 3px solid var(--card);
      box-shadow: 0 4px 14px rgba(0,0,0,0.22);
    }
    .card-rating {
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(0,0,0,0.38);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 2rem;
      padding: 0.18rem 0.55rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: white;
    }

    .card-body {
      padding: 1.75rem 1rem 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.975rem;
      color: var(--foreground);
      line-height: 1.3;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-loc {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.72rem;
      color: var(--muted-foreground);
      margin-bottom: 0.65rem;
    }
    .card-sports {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: auto;
      padding-bottom: 0.75rem;
    }
    .sport-tag {
      font-size: 0.68rem;
      padding: 0.18rem 0.55rem;
      border-radius: 2rem;
      font-weight: 600;
      background: hsl(152,69%,40%,0.1);
      color: var(--primary);
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.65rem;
      border-top: 1px solid var(--border);
      margin-top: 0.65rem;
    }
    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .card-price {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--primary);
      line-height: 1;
    }
    .card-courts {
      font-size: 0.68rem;
      color: var(--muted-foreground);
    }
    .card-cta {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.45rem 0.9rem;
      border-radius: 0.65rem;
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      font-family: 'Space Grotesk', sans-serif;
      transition: opacity 0.15s;
      pointer-events: none;
    }
    .arena-card:hover .card-cta { opacity: 0.88; }

    /* ── Filtro unificado ── */
    .search-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .search-wrap {
      position: relative;
      flex: 1;
    }
    .filter-btn {
      position: relative;
      height: 2.75rem;
      min-width: 2.75rem;
      padding: 0 0.95rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--foreground);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.82rem;
      transition: all 0.15s ease;
    }
    .filter-btn:hover { border-color: var(--primary); }
    .filter-btn.has-active {
      border-color: var(--primary);
      background: hsl(152,69%,40%,0.08);
      color: var(--primary);
    }
    .filter-badge {
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.3rem;
      border-radius: 999px;
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .active-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.55rem 0.3rem 0.7rem;
      border-radius: 999px;
      background: hsl(152,69%,40%,0.1);
      color: var(--primary);
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid hsl(152,69%,40%,0.25);
    }
    .pill button {
      background: none;
      border: none;
      padding: 0;
      display: flex;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
    }
    .pill button:hover { opacity: 1; }
    .pill.rating {
      background: hsl(45,93%,47%,0.12);
      color: #b45309;
      border-color: hsl(45,93%,47%,0.3);
    }
    .pill-clear {
      background: transparent;
      border: 1px dashed var(--border);
      color: var(--muted-foreground);
      cursor: pointer;
      padding: 0.3rem 0.7rem;
      font-size: 0.72rem;
      font-weight: 600;
      border-radius: 999px;
    }
    .pill-clear:hover { color: var(--foreground); border-color: var(--muted-foreground); }

    /* ── Bottom sheet ── */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(3px);
      z-index: 50;
      animation: fade-in 0.18s ease;
    }
    .sheet {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--card);
      border-radius: 1.25rem 1.25rem 0 0;
      z-index: 51;
      max-height: 80vh;
      overflow-y: auto;
      animation: slide-up 0.22s cubic-bezier(0.22,1,0.36,1);
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    @media (min-width: 640px) {
      .sheet {
        left: 50%;
        right: auto;
        bottom: auto;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 440px;
        border-radius: 1.25rem;
        animation: fade-in 0.18s ease;
      }
    }
    .sheet-grip {
      width: 36px;
      height: 4px;
      background: var(--border);
      border-radius: 999px;
      margin: 0.6rem auto 0;
    }
    @media (min-width: 640px) { .sheet-grip { display: none; } }
    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem 0.25rem;
    }
    .sheet-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--foreground);
    }
    .sheet-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      padding: 0.3rem;
      display: flex;
      border-radius: 0.5rem;
    }
    .sheet-close:hover { background: var(--border); color: var(--foreground); }
    .sheet-body { padding: 0.5rem 1.25rem 1.25rem; }
    .sheet-section { margin-top: 1rem; }
    .sheet-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
      margin-bottom: 0.6rem;
    }
    .chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--background);
      color: var(--foreground);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .chip:hover { border-color: var(--primary); }
    .chip.active {
      border-color: var(--primary);
      background: hsl(152,69%,40%,0.1);
      color: var(--primary);
    }
    .chip.rating.active {
      border-color: #f59e0b;
      background: hsl(45,93%,47%,0.12);
      color: #b45309;
    }
    .sheet-footer {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem 1rem;
      border-top: 1px solid var(--border);
      position: sticky;
      bottom: 0;
      background: var(--card);
    }
    .sheet-footer button { flex: 1; }

    @keyframes slide-up {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `],
  template: `
    <div class="mx-auto px-4 pb-24" style="max-width:min(100%,1080px)">

      <!-- Hero -->
      <div class="pt-6 pb-5">
        <h1 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Encontre sua arena</h1>
        <p class="text-sm" style="color:var(--muted-foreground)">Reserve quadras nas melhores arenas da sua cidade</p>
      </div>

      <!-- Search + Filtros -->
      <div class="search-row">
        <div class="search-wrap">
          <span class="material-icons" style="position:absolute;left:0.85rem;top:50%;transform:translateY(-50%);font-size:1.15rem;color:var(--muted-foreground);pointer-events:none">search</span>
          <input class="input" style="padding-left:2.6rem;height:2.75rem;font-size:0.95rem"
                 [(ngModel)]="search" placeholder="Nome da arena...">
          <button *ngIf="search" (click)="search=''"
                  style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted-foreground);padding:0;display:flex">
            <span class="material-icons" style="font-size:1rem">close</span>
          </button>
        </div>

        <button class="filter-btn"
                [class.has-active]="activeFilterCount > 0"
                (click)="openFilters()"
                aria-label="Abrir filtros">
          <span class="material-icons" style="font-size:1.05rem">tune</span>
          <span class="hidden sm:inline">Filtros</span>
          <span *ngIf="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- Pills de filtros ativos -->
      <div *ngIf="activeFilterCount > 0" class="active-pills">
        <span *ngIf="sportFilter" class="pill">
          <span class="material-icons" style="font-size:0.85rem">{{ sportIcon(sportFilter) }}</span>
          {{ sportLabel(sportFilter) }}
          <button (click)="sportFilter=''" aria-label="Remover filtro esporte">
            <span class="material-icons" style="font-size:0.95rem">close</span>
          </button>
        </span>
        <span *ngIf="ratingFilter" class="pill rating">
          <span class="material-icons" style="font-size:0.85rem;color:#f59e0b">star</span>
          {{ ratingLabel(ratingFilter) }}
          <button (click)="ratingFilter=0" aria-label="Remover filtro avaliação">
            <span class="material-icons" style="font-size:0.95rem">close</span>
          </button>
        </span>
        <button class="pill-clear" (click)="clearFilters()">Limpar tudo</button>
      </div>

      <!-- Loading -->
      <div *ngIf="arenaService.loading()" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border);animation:spin 1s linear infinite">refresh</span>
        <p class="text-sm" style="color:var(--muted-foreground)">Buscando arenas...</p>
      </div>

      <!-- Erro -->
      <div *ngIf="arenaService.error() && !arenaService.loading()" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border)">wifi_off</span>
        <p class="font-heading font-bold mb-1" style="color:var(--foreground)">Erro ao carregar arenas</p>
        <p class="text-sm mb-3" style="color:var(--muted-foreground)">{{ arenaService.error() }}</p>
        <button class="btn-primary" (click)="load()">Tentar novamente</button>
      </div>

      <!-- Contagem -->
      <div *ngIf="!arenaService.loading() && !arenaService.error()" class="flex items-center justify-between mb-3">
        <p class="text-xs font-medium" style="color:var(--muted-foreground)">
          {{ filtered.length }} arena{{ filtered.length !== 1 ? 's' : '' }} encontrada{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Grid de arenas -->
      <div class="arena-grid" *ngIf="!arenaService.loading() && filtered.length > 0">
        <div *ngFor="let arena of filtered"
             class="arena-card"
             (click)="select.emit(arena)">

          <!-- Banner colorido -->
          <div class="card-banner"
               [style.background]="'linear-gradient(145deg,' + arena.logo_color + '60 0%,' + arena.logo_color + '22 100%)'">

            <!-- Foto de perfil como banner desfocado -->
            <img *ngIf="arena.logo_url"
                 class="card-banner-img"
                 [src]="arena.logo_url"
                 alt="" />

            <span class="material-icons card-banner-deco">sports_volleyball</span>

            <!-- Rating badge -->
            <div class="card-rating">
              <span class="material-icons" style="font-size:0.7rem;color:#f59e0b">star</span>
              {{ arena.rating }}
              <span style="opacity:0.7;font-weight:400">({{ arena.reviews_count }})</span>
            </div>

            <!-- Avatar -->
            <div class="card-avatar-wrap">
              <div class="card-avatar" [style.background]="arena.logo_color">
                <img *ngIf="arena.logo_url"
                     [src]="arena.logo_url"
                     alt="Logo"
                     style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />
                <span *ngIf="!arena.logo_url">{{ arena.logo_initials }}</span>
              </div>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="card-body">
            <div class="card-name">{{ arena.name }}</div>

            <div class="card-loc">
              <span class="material-icons" style="font-size:0.75rem">location_on</span>
              {{ arena.neighborhood }} · {{ arena.city }}
            </div>

            <div class="card-sports">
              <span *ngFor="let s of arena.sports" class="sport-tag">{{ s }}</span>
            </div>

            <div class="card-footer">
              <div class="card-meta">
                <span class="card-price">R\${{ arena.price_from }}{{ arena.price_from !== arena.price_to ? '–' + arena.price_to : '' }}<span>/h</span></span>
                <span class="card-courts">{{ getCourtsCount(arena) }} quadra{{ getCourtsCount(arena) !== 1 ? 's' : '' }} disponíveis</span>
              </div>
              <div class="card-cta">
                Ver quadras
                <span class="material-icons" style="font-size:0.85rem">arrow_forward</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom sheet de filtros -->
      <ng-container *ngIf="filtersOpen">
        <div class="sheet-backdrop" (click)="closeFilters()"></div>
        <div class="sheet" role="dialog" aria-label="Filtros">
          <div class="sheet-grip"></div>
          <div class="sheet-header">
            <span class="sheet-title">Filtros</span>
            <button class="sheet-close" (click)="closeFilters()" aria-label="Fechar">
              <span class="material-icons" style="font-size:1.25rem">close</span>
            </button>
          </div>

          <div class="sheet-body">
            <div class="sheet-section">
              <div class="sheet-label">Esporte</div>
              <div class="chip-group">
                <button *ngFor="let s of sports"
                        class="chip"
                        [class.active]="draftSport === s.value"
                        (click)="draftSport = draftSport === s.value ? '' : s.value">
                  <span class="material-icons" style="font-size:0.95rem">{{ s.icon }}</span>
                  {{ s.label }}
                </button>
              </div>
            </div>

            <div class="sheet-section">
              <div class="sheet-label">Avaliação mínima</div>
              <div class="chip-group">
                <button *ngFor="let r of ratingOptions"
                        class="chip rating"
                        [class.active]="draftRating === r.value"
                        (click)="draftRating = draftRating === r.value ? 0 : r.value">
                  <span class="material-icons" style="font-size:0.95rem;color:#f59e0b">star</span>
                  {{ r.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-ghost" (click)="resetDraft()">Limpar</button>
            <button class="btn-primary" (click)="applyFilters()">
              Aplicar{{ draftCount > 0 ? ' (' + draftCount + ')' : '' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Empty state -->
      <div *ngIf="!arenaService.loading() && !arenaService.error() && filtered.length === 0" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border)">search_off</span>
        <p class="font-heading font-bold mb-1" style="color:var(--foreground)">Nenhuma arena encontrada</p>
        <p class="text-sm" style="color:var(--muted-foreground)">Tente outro nome ou remova os filtros</p>
        <button class="btn-ghost mt-3" (click)="clearFilters()">Limpar filtros</button>
      </div>

    </div>
  `
})
export class SearchComponent implements OnInit {
  @Output() select = new EventEmitter<Arena>();

  search = '';
  sportFilter = '';
  ratingFilter = 0;

  // Bottom sheet
  filtersOpen = false;
  draftSport = '';
  draftRating = 0;

  sports = [
    { value: 'futevôlei',    label: 'Futevôlei',    icon: 'sports_volleyball' },
    { value: 'vôlei',        label: 'Vôlei',        icon: 'sports_volleyball' },
    { value: 'beach tennis', label: 'Beach Tennis', icon: 'sports_tennis'     },
    { value: 'futebol',      label: 'Futebol',      icon: 'sports_soccer'     },
  ];

  ratingOptions = [
    { value: 5,   label: '5,0'  },
    { value: 4.5, label: '4,5+' },
    { value: 4,   label: '4,0+' },
    { value: 3,   label: '3,0+' },
  ];

  constructor(public arenaService: ArenaService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.arenaService.loadArenas().subscribe();
  }

  get filtered(): Arena[] {
    return this.arenaService.arenas().filter(a => {
      const matchSearch = !this.search || a.name.toLowerCase().includes(this.search.toLowerCase());
      const matchSport  = !this.sportFilter || a.sports.includes(this.sportFilter as SportType);
      const matchRating = !this.ratingFilter || (a.rating ?? 0) >= this.ratingFilter;
      return matchSearch && matchSport && matchRating;
    });
  }

  getCourtsCount(arena: Arena): number {
    return arena.courts?.filter(c => c.status === 'disponível').length ?? 0;
  }

  clearFilters() {
    this.search = '';
    this.sportFilter = '';
    this.ratingFilter = 0;
  }

  get activeFilterCount(): number {
    return (this.sportFilter ? 1 : 0) + (this.ratingFilter ? 1 : 0);
  }

  get draftCount(): number {
    return (this.draftSport ? 1 : 0) + (this.draftRating ? 1 : 0);
  }

  openFilters() {
    this.draftSport = this.sportFilter;
    this.draftRating = this.ratingFilter;
    this.filtersOpen = true;
  }

  closeFilters() {
    this.filtersOpen = false;
  }

  applyFilters() {
    this.sportFilter = this.draftSport;
    this.ratingFilter = this.draftRating;
    this.filtersOpen = false;
  }

  resetDraft() {
    this.draftSport = '';
    this.draftRating = 0;
  }

  sportLabel(v: string): string {
    return this.sports.find(s => s.value === v)?.label ?? v;
  }

  sportIcon(v: string): string {
    return this.sports.find(s => s.value === v)?.icon ?? 'sports';
  }

  ratingLabel(v: number): string {
    return this.ratingOptions.find(r => r.value === v)?.label ?? (v + '+');
  }
}
