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
  `],
  template: `
    <div class="mx-auto px-4 pb-24" style="max-width:min(100%,1080px)">

      <!-- Hero -->
      <div class="pt-6 pb-5">
        <h1 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Encontre sua arena</h1>
        <p class="text-sm" style="color:var(--muted-foreground)">Reserve quadras nas melhores arenas da sua cidade</p>
      </div>

      <!-- Search bar -->
      <div style="position:relative" class="mb-4">
        <span class="material-icons" style="position:absolute;left:0.85rem;top:50%;transform:translateY(-50%);font-size:1.15rem;color:var(--muted-foreground);pointer-events:none">search</span>
        <input class="input" style="padding-left:2.6rem;height:2.75rem;font-size:0.95rem"
               [(ngModel)]="search" placeholder="Nome da arena...">
        <button *ngIf="search" (click)="search=''"
                style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted-foreground);padding:0;display:flex">
          <span class="material-icons" style="font-size:1rem">close</span>
        </button>
      </div>

      <!-- Filtros: esporte -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-5" style="-webkit-overflow-scrolling:touch;scrollbar-width:none">
        <button *ngFor="let s of sports"
                class="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border"
                [style.background]="sportFilter === s.value ? 'hsl(152,69%,40%,0.1)' : 'var(--card)'"
                [style.color]="sportFilter === s.value ? 'var(--primary)' : 'var(--muted-foreground)'"
                [style.border-color]="sportFilter === s.value ? 'var(--primary)' : 'var(--border)'"
                (click)="sportFilter = sportFilter === s.value ? '' : s.value">
          <span class="material-icons" style="font-size:0.85rem">{{ s.icon }}</span>
          {{ s.label }}
        </button>
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

  sports = [
    { value: 'futevôlei',    label: 'Futevôlei',    icon: 'sports_volleyball' },
    { value: 'vôlei',        label: 'Vôlei',        icon: 'sports_volleyball' },
    { value: 'beach tennis', label: 'Beach Tennis', icon: 'sports_tennis'     },
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
      return matchSearch && matchSport;
    });
  }

  getCourtsCount(arena: Arena): number {
    return arena.courts?.filter(c => c.status === 'disponível').length ?? 0;
  }

  clearFilters() {
    this.search = '';
    this.sportFilter = '';
  }
}
