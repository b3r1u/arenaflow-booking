import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Booking } from '../../models/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-lg mx-auto px-4 pb-24 pt-4">
      <h2 class="font-heading font-bold text-xl mb-1" style="color:var(--foreground)">Minhas Reservas</h2>
      <p class="text-sm mb-5" style="color:var(--muted-foreground)">Busque pelo seu nome para ver seu histórico</p>

      <div style="position:relative" class="mb-5">
        <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">search</span>
        <input class="input" style="padding-left:2.25rem" [(ngModel)]="searchName" placeholder="Digite seu nome...">
      </div>

      <div class="space-y-3" *ngIf="myBookings.length > 0">
        <div *ngFor="let b of myBookings" class="card p-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="font-heading font-semibold text-sm" style="color:var(--foreground)">
                {{ getArenaName(b.arena_id) }} — {{ getCourtName(b.arena_id, b.court_id) }}
              </div>
              <div class="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style="color:var(--muted-foreground)">
                <span class="flex items-center gap-0.5">
                  <span class="material-icons" style="font-size:0.8rem">calendar_today</span>
                  {{ b.date | date:'dd/MM/yyyy':'UTC' }}
                </span>
                <span class="flex items-center gap-0.5">
                  <span class="material-icons" style="font-size:0.8rem">schedule</span>
                  {{ b.start_hour }}–{{ b.end_hour }}
                </span>
              </div>
            </div>
            <span class="badge flex-shrink-0" [ngClass]="b.payment_status === 'pago' ? 'badge-primary' : 'badge-accent'">
              {{ b.payment_status }}
            </span>
          </div>
          <div class="flex items-center justify-between pt-2.5" style="border-top:1px solid var(--border)">
            <span class="text-sm" style="color:var(--muted-foreground)">
              Total: <strong class="font-heading" style="color:var(--foreground)">R\${{ b.total_amount }}</strong>
            </span>
            <button *ngIf="b.payment_status === 'pendente'"
                    class="text-xs btn-outline py-1.5 px-3"
                    style="color:var(--primary);border-color:var(--primary)">
              Pagar agora
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="searchName && myBookings.length === 0" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:2.5rem;color:var(--border)">search_off</span>
        <p class="font-medium mb-1" style="color:var(--foreground)">Nenhuma reserva encontrada</p>
        <p class="text-sm" style="color:var(--muted-foreground)">Confira o nome e tente novamente</p>
      </div>

      <div *ngIf="!searchName" class="text-center py-16">
        <span class="material-icons mb-3 block" style="font-size:2.5rem;color:var(--border)">person_search</span>
        <p class="text-sm" style="color:var(--muted-foreground)">Digite seu nome para ver suas reservas</p>
      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  searchName = '';
  bookings: Booking[] = [];
  arenas = this.data.getArenas();
  courts = this.data.getCourts();

  constructor(private data: DataService) {}
  ngOnInit() { this.data.bookings$.subscribe(b => this.bookings = b); }

  get myBookings(): Booking[] {
    if (!this.searchName.trim()) return [];
    return this.bookings.filter(b => b.client_name.toLowerCase().includes(this.searchName.toLowerCase()));
  }

  getArenaName(id: string)              { return this.arenas.find(a => a.id === id)?.name || 'Arena'; }
  getCourtName(arenaId: string, courtId: string) {
    return this.courts.find(c => c.arena_id === arenaId && c.id === courtId)?.name || 'Quadra';
  }
}
