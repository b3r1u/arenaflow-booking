import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Arena, Booking, Court } from '../../models/models';

@Component({
  selector: 'app-arena-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-lg mx-auto px-4 pb-24">

      <!-- Back -->
      <button class="btn-ghost mt-4 mb-4 px-0 -ml-1" (click)="back.emit()">
        <span class="material-icons" style="font-size:1.1rem">arrow_back</span> Todas as arenas
      </button>

      <!-- Arena header card -->
      <div class="card overflow-hidden mb-5" style="border-radius:1rem">
        <div class="h-2 w-full" [style.background]="arena.logo_color"></div>
        <div class="p-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-bold text-white text-lg flex-shrink-0"
                 [style.background]="arena.logo_color"
                 style="box-shadow:0 4px 14px rgba(0,0,0,0.2)">
              {{ arena.logo_initials }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-heading font-bold text-lg leading-tight" style="color:var(--foreground)">{{ arena.name }}</div>
              <div class="flex items-center gap-1 mt-0.5" style="color:var(--muted-foreground)">
                <span class="material-icons" style="font-size:0.85rem">location_on</span>
                <span class="text-xs">{{ arena.neighborhood }} · {{ arena.city }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1.5">
                <div class="flex items-center gap-1">
                  <span class="material-icons" style="font-size:0.85rem;color:#f59e0b">star</span>
                  <span class="font-heading font-bold text-xs" style="color:var(--foreground)">{{ arena.rating }}</span>
                  <span class="text-xs" style="color:var(--muted-foreground)">({{ arena.reviews_count }} avaliações)</span>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs mt-3" style="color:var(--muted-foreground)">{{ arena.description }}</p>
          <div class="flex gap-4 mt-3 text-xs" style="color:var(--muted-foreground)">
            <span class="flex items-center gap-1">
              <span class="material-icons" style="font-size:0.85rem">schedule</span>
              {{ arena.open_hours }}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-icons" style="font-size:0.85rem">phone</span>
              {{ arena.phone }}
            </span>
          </div>
        </div>
      </div>

      <!-- ══ STEP 1: Escolher quadra ══ -->
      <div *ngIf="step === 1">
        <h2 class="font-heading font-bold text-base mb-3" style="color:var(--foreground)">Escolha a quadra</h2>
        <div class="space-y-2.5">
          <div *ngFor="let court of availableCourts"
               class="card p-4 cursor-pointer transition-all duration-150 hover:shadow-md"
               [style.border-color]="form.court_id === court.id ? 'var(--primary)' : ''"
               [style.box-shadow]="form.court_id === court.id ? '0 0 0 2px hsl(152,69%,40%,0.2)' : ''"
               (click)="selectCourt(court)">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style="background:hsl(152,69%,40%,0.1);color:var(--primary)">
                <span class="material-icons" style="font-size:1.2rem">sports_volleyball</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-heading font-semibold text-sm" style="color:var(--foreground)">{{ court.name }}</div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">{{ court.sport_type }} · {{ court.description }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-heading font-bold" style="color:var(--primary)">R\${{ court.hourly_rate }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">/hora</div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="availableCourts.length === 0" class="text-center py-12">
          <span class="material-icons mb-2 block" style="font-size:2.5rem;color:var(--border)">sports_volleyball</span>
          <p style="color:var(--muted-foreground)">Nenhuma quadra disponível no momento</p>
        </div>
      </div>

      <!-- ══ STEP 2: Data e horário ══ -->
      <div *ngIf="step === 2">
        <button class="btn-ghost mb-4 px-0 -ml-1" (click)="step = 1">
          <span class="material-icons" style="font-size:1.1rem">arrow_back</span> Escolher outra quadra
        </button>
        <h2 class="font-heading font-bold text-base mb-1" style="color:var(--foreground)">Data e horário</h2>
        <p class="text-xs mb-4" style="color:var(--muted-foreground)">{{ selectedCourt?.name }} · R\${{ selectedCourt?.hourly_rate }}/h</p>

        <div class="card p-5 space-y-4 mb-5">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Data</label>
            <input class="input" type="date" [(ngModel)]="form.date" [min]="todayStr" (ngModelChange)="onSlotChange()">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Início</label>
              <select class="select" [(ngModel)]="form.start_hour" (ngModelChange)="onSlotChange()">
                <option *ngFor="let h of hours" [value]="h">{{ h }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Fim</label>
              <select class="select" [(ngModel)]="form.end_hour" (ngModelChange)="onSlotChange()">
                <option *ngFor="let h of endHours" [value]="h">{{ h }}</option>
              </select>
            </div>
          </div>

          <div *ngIf="slotConflict" class="flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium"
               style="background:hsl(0,84%,60%,0.08);color:var(--destructive);border:1px solid hsl(0,84%,60%,0.2)">
            <span class="material-icons" style="font-size:1.1rem">warning</span>
            Horário já ocupado — escolha outro.
          </div>

          <div *ngIf="durationHours > 0 && !slotConflict"
               class="flex items-center justify-between p-4 rounded-xl"
               style="background:hsl(152,69%,40%,0.06);border:1px solid hsl(152,69%,40%,0.18)">
            <span class="text-sm" style="color:var(--muted-foreground)">{{ durationHours }}h × R\${{ selectedCourt?.hourly_rate }}/h</span>
            <span class="font-heading font-bold text-xl" style="color:var(--primary)">R\${{ form.total_amount }}</span>
          </div>
        </div>

        <button class="btn-primary w-full py-3" (click)="step = 3"
                [disabled]="slotConflict || durationHours <= 0">
          Continuar <span class="material-icons" style="font-size:1rem">arrow_forward</span>
        </button>
      </div>

      <!-- ══ STEP 3: Seus dados ══ -->
      <div *ngIf="step === 3">
        <button class="btn-ghost mb-4 px-0 -ml-1" (click)="step = 2">
          <span class="material-icons" style="font-size:1.1rem">arrow_back</span> Alterar horário
        </button>
        <h2 class="font-heading font-bold text-base mb-4" style="color:var(--foreground)">Seus dados</h2>

        <div class="card p-5 space-y-4 mb-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Nome completo *</label>
            <div style="position:relative">
              <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">person</span>
              <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_name" placeholder="Seu nome completo">
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Telefone (WhatsApp)</label>
            <div style="position:relative">
              <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">phone</span>
              <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_phone"
                     placeholder="(00) 00000-0000" maxlength="15" (input)="onPhoneInput($event)">
            </div>
          </div>
          <div class="flex items-center justify-between py-1" style="border-top:1px solid var(--border)">
            <div>
              <div class="text-sm font-semibold" style="color:var(--foreground)">Dividir pagamento?</div>
              <div>
                <input type="number" class="input mt-1" style="max-width:80px;padding:0.4rem 0.6rem;font-size:0.8rem"
                       *ngIf="form.split_payment" [(ngModel)]="form.num_players" min="2" max="20">
                <div *ngIf="form.split_payment" class="text-xs mt-0.5" style="color:var(--primary)">
                  R\${{ perPlayerAmount | number:'1.2-2' }} por jogador
                </div>
              </div>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="form.split_payment">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Resumo -->
        <div class="card p-4 mb-5" style="border-color:var(--primary);border-width:1.5px">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons" style="font-size:1rem;color:var(--primary)">receipt_long</span>
            <h3 class="font-heading font-semibold text-sm" style="color:var(--foreground)">Resumo da reserva</h3>
          </div>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Arena</span>
              <span class="font-medium" style="color:var(--foreground)">{{ arena.name }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Quadra</span>
              <span class="font-medium" style="color:var(--foreground)">{{ selectedCourt?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Data</span>
              <span class="font-medium" style="color:var(--foreground)">{{ form.date | date:'dd/MM/yyyy':'UTC' }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Horário</span>
              <span class="font-medium" style="color:var(--foreground)">{{ form.start_hour }} – {{ form.end_hour }}</span>
            </div>
            <div class="flex justify-between pt-2 font-heading font-bold text-base" style="border-top:1px solid var(--border)">
              <span style="color:var(--foreground)">Total</span>
              <span style="color:var(--primary)">R\${{ form.total_amount }}</span>
            </div>
          </div>
        </div>

        <button class="btn-primary w-full py-3" (click)="confirm()" [disabled]="!form.client_name.trim()">
          <span class="material-icons" style="font-size:1rem">pix</span>
          Confirmar e Pagar via PIX
        </button>
      </div>

      <!-- ══ STEP 4: Confirmação + PIX ══ -->
      <div *ngIf="step === 4" class="text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
             style="background:hsl(152,69%,40%,0.12)">
          <span class="material-icons" style="font-size:2rem;color:var(--primary)">check_circle</span>
        </div>
        <h2 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Reserva confirmada!</h2>
        <p class="text-sm mb-6" style="color:var(--muted-foreground)">Conclua o pagamento via PIX para garantir seu horário</p>

        <div class="card p-5 mb-4 text-left">
          <div class="w-44 h-44 rounded-2xl mx-auto mb-5 flex items-center justify-center"
               style="background:var(--muted)">
            <span class="material-icons" style="font-size:4rem;color:var(--muted-foreground)">qr_code_2</span>
          </div>
          <div class="p-3.5 rounded-xl mb-4 text-center" style="background:var(--muted)">
            <div class="text-xs mb-1" style="color:var(--muted-foreground)">Chave PIX</div>
            <div class="font-heading font-bold text-sm" style="color:var(--foreground)">{{ arena.phone }}</div>
          </div>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Arena</span>
              <span class="font-medium" style="color:var(--foreground)">{{ arena.name }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Valor</span>
              <span class="font-heading font-bold" style="color:var(--primary)">R\${{ confirmedBooking?.total_amount }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Status</span>
              <span class="badge badge-accent">aguardando pagamento</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="btn-outline flex-1" (click)="resetToArena()">
            <span class="material-icons" style="font-size:1rem">add</span>
            Nova reserva aqui
          </button>
          <button class="btn-outline flex-1" (click)="back.emit()">
            <span class="material-icons" style="font-size:1rem">search</span>
            Outras arenas
          </button>
        </div>
      </div>

    </div>
  `
})
export class ArenaDetailComponent implements OnInit {
  @Input() arena!: Arena;
  @Output() back = new EventEmitter<void>();

  courts: Court[] = [];
  selectedCourt: Court | null = null;
  step = 1;
  slotConflict = false;
  durationHours = 0;
  confirmedBooking: Booking | null = null;

  form = this.emptyForm();

  hours    = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);
  get endHours()       { return this.hours.slice(1); }
  get todayStr()       { return new Date().toISOString().split('T')[0]; }
  get availableCourts(){ return this.courts.filter(c => c.status !== 'bloqueada'); }
  get perPlayerAmount(){ return this.form.num_players > 1 ? this.form.total_amount / this.form.num_players : this.form.total_amount; }

  constructor(private data: DataService, private toast: ToastService) {}

  ngOnInit() {
    this.courts = this.data.getCourtsForArena(this.arena.id);
  }

  emptyForm() {
    return {
      court_id: '', date: new Date().toISOString().split('T')[0],
      start_hour: '09:00', end_hour: '10:00',
      client_name: '', client_phone: '',
      num_players: 2, split_payment: false, total_amount: 0
    };
  }

  selectCourt(court: Court) {
    this.form.court_id = court.id;
    this.selectedCourt = court;
    this.calcTotal();
    this.step = 2;
  }

  onSlotChange() {
    this.calcTotal();
    if (this.form.court_id) {
      this.slotConflict = this.data.isSlotOccupied(this.arena.id, this.form.court_id, this.form.date, this.form.start_hour, this.form.end_hour);
    }
  }

  calcTotal() {
    const s = parseInt(this.form.start_hour), e = parseInt(this.form.end_hour);
    this.durationHours = e > s ? e - s : 0;
    this.form.total_amount = this.durationHours * (this.selectedCourt?.hourly_rate || 0);
  }

  confirm() {
    if (!this.form.client_name.trim()) return;
    const booking = this.data.addBooking({
      arena_id:       this.arena.id,
      client_name:    this.form.client_name,
      client_phone:   this.form.client_phone,
      court_id:       this.form.court_id,
      date:           this.form.date,
      start_hour:     this.form.start_hour,
      end_hour:       this.form.end_hour,
      payment_status: 'pendente',
      total_amount:   this.form.total_amount,
      duration_hours: this.durationHours,
    });
    this.confirmedBooking = booking;
    this.step = 4;
    this.toast.show('Reserva criada! Aguardando pagamento.');
  }

  resetToArena() {
    this.form = this.emptyForm();
    this.selectedCourt = null;
    this.slotConflict = false;
    this.durationHours = 0;
    this.step = 1;
  }

  onPhoneInput(event: Event) {
    const el = event.target as HTMLInputElement;
    const d = el.value.replace(/\D/g, '').slice(0, 11);
    let m = '';
    if (d.length === 0)      m = '';
    else if (d.length <= 2)  m = `(${d}`;
    else if (d.length <= 6)  m = `(${d.slice(0,2)}) ${d.slice(2)}`;
    else if (d.length <= 10) m = `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    else                     m = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    el.value = m;
    this.form.client_phone = m;
  }
}
