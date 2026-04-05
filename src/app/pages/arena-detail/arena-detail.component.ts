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
  styles: [`
    /* ── Hero ── */
    .arena-hero {
      position: relative;
      height: 220px;
      overflow: hidden;
    }
    .hero-deco {
      position: absolute;
      right: -1.5rem;
      bottom: -1rem;
      font-size: 10rem;
      opacity: 0.1;
      color: white;
      transform: rotate(10deg);
      pointer-events: none;
      line-height: 1;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 60%);
    }
    .hero-back {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.38rem 0.85rem;
      border-radius: 2rem;
      background: rgba(0,0,0,0.32);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: white;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.18);
      cursor: pointer;
      transition: background 0.15s;
    }
    .hero-back:hover { background: rgba(0,0,0,0.5); }
    .hero-rating {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.3rem 0.65rem;
      border-radius: 2rem;
      background: rgba(0,0,0,0.32);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .hero-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem 1.25rem 1.1rem;
      display: flex;
      align-items: flex-end;
      gap: 0.875rem;
    }
    .hero-avatar {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.05rem;
      color: white;
      flex-shrink: 0;
      border: 2.5px solid rgba(255,255,255,0.28);
      box-shadow: 0 4px 18px rgba(0,0,0,0.35);
    }
    .hero-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.3rem;
      color: white;
      line-height: 1.2;
    }
    .hero-loc {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.72);
      margin-top: 0.2rem;
    }

    /* ── Info strip ── */
    .info-strip {
      display: flex;
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid var(--border);
    }
    .info-strip::-webkit-scrollbar { display: none; }
    .info-chip {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--muted-foreground);
      padding: 0.75rem 1rem;
      border-right: 1px solid var(--border);
    }
    .info-chip:last-child { border-right: none; }
    .sport-chip {
      background: hsl(152,69%,40%,0.08);
      color: var(--primary);
      font-weight: 600;
      font-size: 0.7rem;
      border-right: none;
    }

    /* ── Court cards grid ── */
    .courts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .court-card {
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 1rem;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.15s;
      display: flex;
      flex-direction: column;
    }
    .court-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(0,0,0,0.1);
      border-color: var(--primary);
    }
    .court-card.selected {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px hsl(152,69%,40%,0.22);
    }

    .court-banner {
      height: 84px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .court-banner-icon {
      font-size: 2.75rem;
      color: white;
      opacity: 0.9;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
      position: relative;
      z-index: 1;
    }
    .court-banner-deco {
      position: absolute;
      right: -0.75rem;
      bottom: -0.75rem;
      font-size: 5rem;
      color: white;
      opacity: 0.08;
      transform: rotate(15deg);
      line-height: 1;
    }
    .court-check {
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.6);
      transition: all 0.18s ease;
      z-index: 2;
    }
    .court-card.selected .court-check {
      opacity: 1;
      transform: scale(1);
    }
    .court-avail {
      position: absolute;
      top: 0.6rem;
      left: 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.5rem;
      border-radius: 2rem;
      background: rgba(0,0,0,0.28);
      backdrop-filter: blur(6px);
      font-size: 0.65rem;
      font-weight: 600;
      color: white;
      z-index: 2;
    }
    .avail-dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 50%;
      background: #4ade80;
      flex-shrink: 0;
    }

    .court-body {
      padding: 0.875rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .court-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--foreground);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .court-sport-tag {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 2rem;
      background: hsl(152,69%,40%,0.1);
      color: var(--primary);
      margin-top: 0.3rem;
    }
    .court-desc {
      font-size: 0.72rem;
      color: var(--muted-foreground);
      margin-top: 0.4rem;
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .court-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
      padding-top: 0.65rem;
      border-top: 1px solid var(--border);
    }
    .court-price {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--primary);
      line-height: 1;
    }
    .court-price small {
      font-size: 0.65rem;
      font-weight: 400;
      color: var(--muted-foreground);
    }
    .court-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--muted);
      color: var(--muted-foreground);
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .court-card:hover .court-cta,
    .court-card.selected .court-cta {
      background: var(--primary);
      color: white;
    }

    /* ── Step indicator ── */
    .step-bar {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 1.25rem;
    }
    .step-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--border);
      transition: all 0.2s;
    }
    .step-dot.active {
      background: var(--primary);
      width: 1.25rem;
      border-radius: 0.25rem;
    }
    .step-dot.done { background: hsl(152,69%,40%,0.4); }
  `],
  template: `
    <div>

      <!-- ═══════ HERO ═══════ -->
      <div class="arena-hero"
           [style.background]="'linear-gradient(150deg,' + arena.logo_color + '80 0%,' + arena.logo_color + '30 100%)'">

        <span class="material-icons hero-deco">sports_volleyball</span>
        <div class="hero-overlay"></div>

        <!-- Back -->
        <button class="hero-back" (click)="back.emit()">
          <span class="material-icons" style="font-size:0.95rem">arrow_back</span>
          Arenas
        </button>

        <!-- Rating -->
        <div class="hero-rating">
          <span class="material-icons" style="font-size:0.7rem;color:#f59e0b">star</span>
          {{ arena.rating }}
          <span style="opacity:0.65;font-weight:400">({{ arena.reviews_count }})</span>
        </div>

        <!-- Arena identity -->
        <div class="hero-content">
          <div class="hero-avatar" [style.background]="arena.logo_color">{{ arena.logo_initials }}</div>
          <div>
            <div class="hero-name">{{ arena.name }}</div>
            <div class="hero-loc">
              <span class="material-icons" style="font-size:0.75rem">location_on</span>
              {{ arena.neighborhood }} · {{ arena.city }}
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ INFO STRIP ═══════ -->
      <div class="info-strip">
        <div class="info-chip">
          <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">schedule</span>
          {{ arena.open_hours }}
        </div>
        <div class="info-chip">
          <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">phone</span>
          {{ arena.phone }}
        </div>
        <div class="info-chip">
          <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">payments</span>
          R\${{ arena.price_from }}–{{ arena.price_to }}/h
        </div>
        <span *ngFor="let s of arena.sports" class="info-chip sport-chip">{{ s }}</span>
      </div>

      <!-- ═══════ CONTENT ═══════ -->
      <div class="px-4 pb-24" style="max-width:640px;margin:0 auto">

        <!-- Description -->
        <p class="text-sm py-4" style="color:var(--muted-foreground);border-bottom:1px solid var(--border)">
          {{ arena.description }}
        </p>

        <!-- Step indicator (steps 1–3) -->
        <div *ngIf="step < 4" class="flex items-center gap-3 pt-4 pb-1">
          <div class="step-bar">
            <div class="step-dot" [class.active]="step===1" [class.done]="step>1"></div>
            <div class="step-dot" [class.active]="step===2" [class.done]="step>2"></div>
            <div class="step-dot" [class.active]="step===3" [class.done]="step>3"></div>
          </div>
          <span class="text-xs" style="color:var(--muted-foreground)">
            {{ step === 1 ? 'Escolha a quadra' : step === 2 ? 'Data e horário' : 'Seus dados' }}
          </span>
        </div>

        <!-- ══ STEP 1: Escolher quadra ══ -->
        <div *ngIf="step === 1" class="pt-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-heading font-bold text-base" style="color:var(--foreground)">Quadras disponíveis</h2>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style="background:hsl(152,69%,40%,0.1);color:var(--primary)">
              {{ availableCourts.length }} disponíve{{ availableCourts.length !== 1 ? 'is' : 'l' }}
            </span>
          </div>

          <div class="courts-grid">
            <div *ngFor="let court of availableCourts"
                 class="court-card"
                 [class.selected]="form.court_id === court.id"
                 (click)="selectCourt(court)">

              <!-- Banner colorido por esporte -->
              <div class="court-banner" [style.background]="getSportGradient(court.sport_type)">
                <span class="material-icons court-banner-deco">{{ getSportIcon(court.sport_type) }}</span>
                <!-- Disponível badge -->
                <div class="court-avail">
                  <span class="avail-dot"></span>
                  Disponível
                </div>
                <!-- Ícone central -->
                <span class="material-icons court-banner-icon">{{ getSportIcon(court.sport_type) }}</span>
                <!-- Check de seleção -->
                <div class="court-check">
                  <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">check</span>
                </div>
              </div>

              <!-- Conteúdo -->
              <div class="court-body">
                <div class="court-name">{{ court.name }}</div>
                <span class="court-sport-tag">{{ court.sport_type }}</span>
                <p *ngIf="court.description" class="court-desc">{{ court.description }}</p>

                <div class="court-footer">
                  <div>
                    <div class="court-price">R\${{ court.hourly_rate }}<small>/h</small></div>
                  </div>
                  <div class="court-cta">
                    <span class="material-icons" style="font-size:0.9rem">arrow_forward</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div *ngIf="availableCourts.length === 0" class="text-center py-14">
            <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border)">sports_volleyball</span>
            <p class="font-heading font-semibold mb-1" style="color:var(--foreground)">Nenhuma quadra disponível</p>
            <p class="text-sm" style="color:var(--muted-foreground)">Tente novamente mais tarde</p>
          </div>
        </div>

        <!-- ══ STEP 2: Data e horário ══ -->
        <div *ngIf="step === 2" class="pt-4">
          <button class="btn-ghost mb-4 px-0 -ml-1" (click)="step = 1">
            <span class="material-icons" style="font-size:1.1rem">arrow_back</span> Outra quadra
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
        <div *ngIf="step === 3" class="pt-4">
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
        <div *ngIf="step === 4" class="text-center pt-8">
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
  get endHours()        { return this.hours.slice(1); }
  get todayStr()        { return new Date().toISOString().split('T')[0]; }
  get availableCourts() { return this.courts.filter(c => c.status !== 'bloqueada'); }
  get perPlayerAmount() { return this.form.num_players > 1 ? this.form.total_amount / this.form.num_players : this.form.total_amount; }

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

  getSportGradient(sport: string): string {
    if (sport.includes('tennis'))  return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (sport.includes('futev'))   return 'linear-gradient(135deg, #0ea5e9, #0284c7)';
    if (sport.includes('vôlei'))   return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    return `linear-gradient(135deg, ${this.arena.logo_color}, ${this.arena.logo_color}bb)`;
  }

  getSportIcon(sport: string): string {
    if (sport.includes('tennis')) return 'sports_tennis';
    return 'sports_volleyball';
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
