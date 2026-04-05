import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Booking, Arena, Court } from '../../models/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .tab-pill {
      flex: 1;
      padding: 0.5rem 0;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: transparent;
    }
    .tab-pill.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 8px hsl(152,69%,40%,0.3);
    }
    .tab-pill:not(.active) {
      color: var(--muted-foreground);
    }
    .booking-card {
      border-radius: 1rem;
      background: var(--card);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: box-shadow 0.2s;
    }
    .booking-card:hover {
      box-shadow: 0 4px 20px hsl(0,0%,0%,0.08);
    }
    .sport-dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 50%;
      background: var(--primary);
      display: inline-block;
      margin-right: 0.35rem;
    }
    .info-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 500;
      background: var(--muted);
      color: var(--muted-foreground);
    }
  `],
  template: `
    <div class="max-w-lg mx-auto px-4 pb-24 pt-4">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-11 h-11 rounded-full flex items-center justify-center font-heading font-bold text-white text-base flex-shrink-0"
             style="background: linear-gradient(135deg, var(--primary), hsl(152,69%,28%))">
          {{ initials }}
        </div>
        <div>
          <h2 class="font-heading font-bold text-lg leading-tight" style="color:var(--foreground)">
            Minhas Reservas
          </h2>
          <p class="text-xs" style="color:var(--muted-foreground)">{{ auth.user()?.email }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 rounded-full mb-5" style="background:var(--muted)">
        <button class="tab-pill" [class.active]="activeTab === 'andamento'" (click)="activeTab = 'andamento'">
          Em andamento
          <span *ngIf="emAndamento.length > 0"
                class="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ml-1 font-bold"
                [style]="activeTab === 'andamento' ? 'background:rgba(255,255,255,0.25);color:white' : 'background:var(--primary);color:white'">
            {{ emAndamento.length }}
          </span>
        </button>
        <button class="tab-pill" [class.active]="activeTab === 'realizadas'" (click)="activeTab = 'realizadas'">
          Já realizadas
        </button>
      </div>

      <!-- Em andamento -->
      <div *ngIf="activeTab === 'andamento'">
        <div *ngIf="emAndamento.length === 0" class="text-center py-16">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style="background:var(--muted)">
            <span class="material-icons" style="font-size:1.8rem;color:var(--border)">event_available</span>
          </div>
          <p class="font-semibold mb-1" style="color:var(--foreground)">Nenhuma reserva ativa</p>
          <p class="text-sm" style="color:var(--muted-foreground)">Suas próximas reservas aparecem aqui</p>
        </div>

        <div class="space-y-3" *ngIf="emAndamento.length > 0">
          <div *ngFor="let b of emAndamento" class="booking-card">

            <!-- Topo colorido -->
            <div class="px-4 py-3 flex items-center justify-between"
                 style="background: linear-gradient(135deg, hsl(152,69%,40%,0.1), hsl(152,69%,40%,0.04)); border-bottom:1px solid var(--border)">
              <div>
                <div class="font-heading font-bold text-sm" style="color:var(--foreground)">
                  {{ getArenaName(b.arena_id) }}
                </div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                  <span class="sport-dot"></span>{{ getCourtName(b.arena_id, b.court_id) }}
                </div>
              </div>
              <span class="badge"
                    [ngClass]="b.payment_status === 'pago' ? 'badge-primary' : b.payment_status === 'parcial' ? 'badge-warning' : 'badge-accent'">
                {{ b.payment_status === 'parcial' ? 'entrada paga' : b.payment_status }}
              </span>
            </div>

            <!-- Infos -->
            <div class="px-4 py-3">
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="info-chip">
                  <span class="material-icons" style="font-size:0.75rem">calendar_today</span>
                  {{ b.date | date:'dd/MM/yyyy':'UTC' }}
                </span>
                <span class="info-chip">
                  <span class="material-icons" style="font-size:0.75rem">schedule</span>
                  {{ b.start_hour }} – {{ b.end_hour }}
                </span>
                <span class="info-chip" *ngIf="b.split_payment && b.num_players">
                  <span class="material-icons" style="font-size:0.75rem">group</span>
                  {{ b.num_players }} jogadores
                </span>
              </div>

              <!-- Valores -->
              <div class="rounded-xl p-3 space-y-1.5" style="background:var(--muted)">
                <div class="flex justify-between text-sm">
                  <span style="color:var(--muted-foreground)">Total da reserva</span>
                  <span class="font-heading font-bold" style="color:var(--foreground)">R\${{ b.total_amount | number:'1.2-2' }}</span>
                </div>
                <ng-container *ngIf="b.payment_option === '50'">
                  <div class="flex justify-between text-sm">
                    <span style="color:var(--muted-foreground)">Entrada paga</span>
                    <span style="color:var(--primary);font-weight:600">R\${{ b.paid_amount | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-xs pt-1" style="border-top:1px solid var(--border)">
                    <span style="color:var(--muted-foreground)">Saldo restante</span>
                    <span style="color:var(--muted-foreground);font-weight:600">R\${{ (b.total_amount - b.paid_amount) | number:'1.2-2' }}</span>
                  </div>
                </ng-container>
              </div>

              <!-- Ação -->
              <button *ngIf="b.payment_status === 'parcial'"
                      class="btn-primary w-full mt-3 py-2.5 text-sm">
                <span class="material-icons" style="font-size:0.9rem">pix</span>
                Pagar saldo restante via PIX
              </button>
              <button *ngIf="b.payment_status === 'pendente'"
                      class="btn-primary w-full mt-3 py-2.5 text-sm">
                <span class="material-icons" style="font-size:0.9rem">pix</span>
                Pagar agora via PIX
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Já realizadas -->
      <div *ngIf="activeTab === 'realizadas'">
        <div *ngIf="jaRealizadas.length === 0" class="text-center py-16">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style="background:var(--muted)">
            <span class="material-icons" style="font-size:1.8rem;color:var(--border)">history</span>
          </div>
          <p class="font-semibold mb-1" style="color:var(--foreground)">Sem histórico ainda</p>
          <p class="text-sm" style="color:var(--muted-foreground)">Suas reservas concluídas aparecem aqui</p>
        </div>

        <div class="space-y-3" *ngIf="jaRealizadas.length > 0">
          <div *ngFor="let b of jaRealizadas" class="booking-card" style="opacity:0.85">

            <div class="px-4 py-3 flex items-center justify-between"
                 style="border-bottom:1px solid var(--border)">
              <div>
                <div class="font-heading font-bold text-sm" style="color:var(--foreground)">
                  {{ getArenaName(b.arena_id) }}
                </div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                  <span class="sport-dot" style="background:var(--muted-foreground)"></span>
                  {{ getCourtName(b.arena_id, b.court_id) }}
                </div>
              </div>
              <span class="badge badge-primary">concluída</span>
            </div>

            <div class="px-4 py-3">
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="info-chip">
                  <span class="material-icons" style="font-size:0.75rem">calendar_today</span>
                  {{ b.date | date:'dd/MM/yyyy':'UTC' }}
                </span>
                <span class="info-chip">
                  <span class="material-icons" style="font-size:0.75rem">schedule</span>
                  {{ b.start_hour }} – {{ b.end_hour }}
                </span>
                <span class="info-chip" *ngIf="b.duration_hours">
                  <span class="material-icons" style="font-size:0.75rem">timer</span>
                  {{ b.duration_hours }}h
                </span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span style="color:var(--muted-foreground)">Valor pago</span>
                <span class="font-heading font-bold" style="color:var(--foreground)">R\${{ b.total_amount | number:'1.2-2' }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  activeTab: 'andamento' | 'realizadas' = 'andamento';
  private bookings: Booking[] = [];
  private arenas: Arena[] = [];
  private courts: Court[] = [];

  constructor(private data: DataService, public auth: AuthService) {}

  ngOnInit() {
    this.arenas = this.data.getArenas();
    this.courts = this.data.getCourts();
    this.data.bookings$.subscribe(b => this.bookings = b);
    this.injectMocks();
  }

  private injectMocks() {
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    const already = this.data.getBookings().some(b => b.id === 'mock-andamento');
    if (already) return;

    // Em andamento — daqui a 2 dias, entrada paga (50%)
    this.data.addBooking({
      id_hint: 'mock-andamento',
      user_uid:       uid,
      arena_id:       '3',
      client_name:    this.auth.user()?.displayName || 'Usuário',
      client_phone:   '',
      court_id:       'c1a3',
      date:           this.offsetDate(2),
      start_hour:     '19:00',
      end_hour:       '21:00',
      payment_status: 'parcial',
      total_amount:   160,
      paid_amount:    80,
      payment_option: '50',
      duration_hours: 2,
      split_payment:  false,
    } as any);

    // Já realizada — 8 dias atrás, pago total (100%)
    this.data.addBooking({
      id_hint: 'mock-realizada',
      user_uid:       uid,
      arena_id:       '1',
      client_name:    this.auth.user()?.displayName || 'Usuário',
      client_phone:   '',
      court_id:       'c1a1',
      date:           this.offsetDate(-8),
      start_hour:     '10:00',
      end_hour:       '12:00',
      payment_status: 'pago',
      total_amount:   120,
      paid_amount:    120,
      payment_option: '100',
      duration_hours: 2,
      split_payment:  false,
    } as any);
  }

  private offsetDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  get initials(): string {
    const name = this.auth.user()?.displayName || this.auth.user()?.email || '?';
    return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('');
  }

  private get userBookings(): Booking[] {
    const uid = this.auth.user()?.uid;
    if (!uid) return [];
    return this.bookings.filter(b => b.user_uid === uid);
  }

  private get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get emAndamento(): Booking[] {
    return this.userBookings
      .filter(b => b.date >= this.todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour.localeCompare(b.start_hour));
  }

  get jaRealizadas(): Booking[] {
    return this.userBookings
      .filter(b => b.date < this.todayStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getArenaName(id: string): string {
    return this.arenas.find(a => a.id === id)?.name || 'Arena';
  }

  getCourtName(arenaId: string, courtId: string): string {
    return this.courts.find(c => c.arena_id === arenaId && c.id === courtId)?.name || 'Quadra';
  }
}
