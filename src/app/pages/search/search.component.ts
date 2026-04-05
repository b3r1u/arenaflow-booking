import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Arena, SportType } from '../../models/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 pb-24">

      <!-- Hero -->
      <div class="pt-6 pb-5">
        <h1 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Encontre sua arena</h1>
        <p class="text-sm" style="color:var(--muted-foreground)">Reserve quadras nas melhores arenas da sua cidade</p>
      </div>

      <!-- Search bar -->
      <div style="position:relative" class="mb-4">
        <span class="material-icons" style="position:absolute;left:0.85rem;top:50%;transform:translateY(-50%);font-size:1.15rem;color:var(--muted-foreground);pointer-events:none">search</span>
        <input class="input" style="padding-left:2.6rem;height:2.75rem;font-size:0.95rem"
               [(ngModel)]="search" placeholder="Nome da arena ou bairro...">
        <button *ngIf="search" (click)="search=''"
                style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted-foreground);padding:0;display:flex">
          <span class="material-icons" style="font-size:1rem">close</span>
        </button>
      </div>

      <!-- Filtros: cidade -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-4" style="-webkit-overflow-scrolling:touch;scrollbar-width:none">
        <button *ngFor="let c of cities"
                class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border"
                [style.background]="cityFilter === c ? 'var(--primary)' : 'var(--card)'"
                [style.color]="cityFilter === c ? 'white' : 'var(--muted-foreground)'"
                [style.border-color]="cityFilter === c ? 'var(--primary)' : 'var(--border)'"
                (click)="cityFilter = cityFilter === c ? '' : c">
          {{ c }}
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

      <!-- Contagem de resultados -->
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-medium" style="color:var(--muted-foreground)">
          {{ filtered.length }} arena{{ filtered.length !== 1 ? 's' : '' }} encontrada{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Lista de arenas -->
      <div class="space-y-3" *ngIf="filtered.length > 0">
        <div *ngFor="let arena of filtered"
             class="card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
             style="border-radius:1rem"
             (click)="select.emit(arena)">

          <!-- Color strip top -->
          <div class="h-1.5 w-full" [style.background]="arena.logo_color + '55'"></div>

          <div class="p-4">
            <div class="flex items-start gap-3.5">
              <!-- Logo avatar -->
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-bold text-white text-sm flex-shrink-0"
                   [style.background]="arena.logo_color"
                   style="box-shadow:0 4px 12px rgba(0,0,0,0.15)">
                {{ arena.logo_initials }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="font-heading font-bold text-base leading-tight" style="color:var(--foreground)">{{ arena.name }}</div>
                  <!-- Rating -->
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="material-icons" style="font-size:0.85rem;color:#f59e0b">star</span>
                    <span class="font-heading font-bold text-xs" style="color:var(--foreground)">{{ arena.rating }}</span>
                    <span class="text-xs" style="color:var(--muted-foreground)">({{ arena.reviews_count }})</span>
                  </div>
                </div>

                <div class="flex items-center gap-1 mt-0.5" style="color:var(--muted-foreground)">
                  <span class="material-icons" style="font-size:0.8rem">location_on</span>
                  <span class="text-xs">{{ arena.neighborhood }} · {{ arena.city }}</span>
                </div>

                <!-- Sports tags -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span *ngFor="let s of arena.sports"
                        class="text-xs px-2 py-0.5 rounded-full font-medium"
                        style="background:hsl(152,69%,40%,0.08);color:var(--primary)">
                    {{ s }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer row -->
            <div class="flex items-center justify-between mt-3 pt-3" style="border-top:1px solid var(--border)">
              <div class="flex items-center gap-3 text-xs" style="color:var(--muted-foreground)">
                <span class="flex items-center gap-1">
                  <span class="material-icons" style="font-size:0.85rem">schedule</span>
                  {{ arena.open_hours }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-icons" style="font-size:0.85rem">sports_volleyball</span>
                  {{ getCourtsCount(arena.id) }} quadra{{ getCourtsCount(arena.id) !== 1 ? 's' : '' }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold" style="color:var(--primary)">
                  R\${{ arena.price_from }}{{ arena.price_from !== arena.price_to ? '–' + arena.price_to : '' }}/h
                </span>
                <div class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                     style="background:var(--primary);color:white">
                  Ver quadras
                  <span class="material-icons" style="font-size:0.85rem">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="filtered.length === 0" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border)">search_off</span>
        <p class="font-heading font-bold mb-1" style="color:var(--foreground)">Nenhuma arena encontrada</p>
        <p class="text-sm" style="color:var(--muted-foreground)">Tente outro termo ou remova os filtros</p>
        <button class="btn-ghost mt-3" (click)="clearFilters()">Limpar filtros</button>
      </div>

    </div>
  `
})
export class SearchComponent implements OnInit {
  @Output() select = new EventEmitter<Arena>();

  arenas: Arena[] = [];
  search = '';
  cityFilter = '';
  sportFilter = '';

  cities: string[] = [];

  sports = [
    { value: 'futevôlei',    label: 'Futevôlei',    icon: 'sports_volleyball' },
    { value: 'vôlei',        label: 'Vôlei',        icon: 'sports_volleyball' },
    { value: 'beach tennis', label: 'Beach Tennis', icon: 'sports_tennis'     },
  ];

  constructor(private data: DataService) {}

  ngOnInit() {
    this.data.arenas$.subscribe(a => {
      this.arenas = a;
      this.cities = [...new Set(a.map(x => x.city))].sort();
    });
  }

  get filtered(): Arena[] {
    return this.arenas.filter(a => {
      const term = this.search.toLowerCase();
      const matchSearch = !term ||
        a.name.toLowerCase().includes(term) ||
        a.neighborhood.toLowerCase().includes(term) ||
        a.city.toLowerCase().includes(term);
      const matchCity  = !this.cityFilter  || a.city === this.cityFilter;
      const matchSport = !this.sportFilter || a.sports.includes(this.sportFilter as SportType);
      return matchSearch && matchCity && matchSport;
    });
  }

  getCourtsCount(arenaId: string): number {
    return this.data.getCourts().filter(c => c.arena_id === arenaId && c.status !== 'bloqueada').length;
  }

  clearFilters() {
    this.search = '';
    this.cityFilter = '';
    this.sportFilter = '';
  }
}
