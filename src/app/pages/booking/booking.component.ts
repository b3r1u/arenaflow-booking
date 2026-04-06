import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Booking, Arena, Court } from '../../models/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    .btn-review {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.55rem 0;
      border-radius: 0.75rem;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid hsl(38,92%,50%,0.4);
      background: hsl(38,92%,50%,0.07);
      color: hsl(38,92%,35%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      transition: background 0.15s;
    }
    .btn-review:hover { background: hsl(38,92%,50%,0.14); }
    .reviewed-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: hsl(38,92%,40%);
    }
    .star-btn {
      background: none;
      border: none;
      padding: 0.15rem;
      cursor: pointer;
      line-height: 1;
    }
    .btn-cancel {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.6rem 0;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid hsl(0,72%,51%,0.35);
      background: transparent;
      color: hsl(0,72%,51%);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .btn-cancel:hover {
      background: hsl(0,72%,51%,0.06);
      border-color: hsl(0,72%,51%,0.6);
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.15s ease;
    }
    .modal-sheet {
      background: var(--card);
      border-radius: 1.25rem;
      padding: 1.75rem 1.5rem;
      width: 100%;
      max-width: 420px;
      animation: scaleIn 0.18s ease;
    }
    @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes scaleIn { from { transform: scale(0.94); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    .btn-confirm-cancel {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.9rem;
      font-family: var(--font-heading, inherit);
      border: none;
      background: hsl(0,72%,51%);
      color: white;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-confirm-cancel:hover { opacity: 0.88; }
    .btn-back {
      width: 100%;
      padding: 0.65rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.85rem;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid var(--border);
      background: transparent;
      color: var(--muted-foreground);
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 0.5rem;
    }
    .btn-back:hover { background: var(--muted); }
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

              <!-- Cancelar — disponível para pago e parcial -->
              <button *ngIf="b.payment_status === 'parcial' || b.payment_status === 'pago'"
                      class="btn-cancel"
                      (click)="openCancelModal(b)">
                <span class="material-icons" style="font-size:0.9rem">cancel</span>
                Cancelar reserva
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Modal de confirmação de cancelamento -->
      <div class="modal-overlay" *ngIf="cancellingBooking" (click)="closeCancelModal()">
        <div class="modal-sheet" (click)="$event.stopPropagation()">

          <!-- Ícone -->
          <div class="flex justify-center mb-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center"
                 style="background:hsl(0,72%,51%,0.1)">
              <span class="material-icons" style="font-size:1.6rem;color:hsl(0,72%,51%)">cancel</span>
            </div>
          </div>

          <!-- Título -->
          <h3 class="font-heading font-bold text-lg text-center mb-1" style="color:var(--foreground)">
            Cancelar reserva?
          </h3>
          <p class="text-sm text-center mb-4" style="color:var(--muted-foreground)">
            Você está cancelando a reserva em
            <strong style="color:var(--foreground)">{{ getArenaName(cancellingBooking.arena_id) }}</strong>
            no dia <strong style="color:var(--foreground)">{{ cancellingBooking.date | date:'dd/MM/yyyy':'UTC' }}</strong>
            às <strong style="color:var(--foreground)">{{ cancellingBooking.start_hour }}</strong>.
          </p>

          <!-- Sem taxa -->
          <div *ngIf="cancellationIsFree"
               class="rounded-xl p-3 mb-5 flex gap-2 items-start"
               style="background:hsl(152,69%,40%,0.08);border:1px solid hsl(152,69%,40%,0.2)">
            <span class="material-icons flex-shrink-0" style="font-size:1rem;color:var(--primary);margin-top:1px">check_circle</span>
            <p class="text-xs leading-relaxed" style="color:var(--primary)">
              Cancelamento <strong>sem taxa</strong> — você está dentro do prazo gratuito. O valor pago será reembolsado integralmente.
            </p>
          </div>

          <!-- Com taxa -->
          <div *ngIf="!cancellationIsFree"
               class="rounded-xl p-3 mb-5 flex gap-2 items-start"
               style="background:hsl(0,84%,60%,0.08);border:1px solid hsl(0,84%,60%,0.25)">
            <span class="material-icons flex-shrink-0" style="font-size:1rem;color:hsl(0,72%,51%);margin-top:1px">warning</span>
            <p class="text-xs leading-relaxed" style="color:hsl(0,72%,40%)">
              Fora do prazo de cancelamento gratuito. Será cobrada uma <strong>taxa de {{ cancellationFeePercent }}%</strong>
              (R\${{ cancellationFeeAmount | number:'1.2-2' }}) sobre o valor já pago.
              O restante (R\${{ (cancellingBooking.paid_amount - cancellationFeeAmount) | number:'1.2-2' }}) será reembolsado.
            </p>
          </div>

          <button class="btn-confirm-cancel" (click)="confirmCancel()">
            Sim, cancelar reserva
          </button>
          <button class="btn-back" (click)="closeCancelModal()">
            Voltar
          </button>
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
              <span *ngIf="b.payment_status !== 'cancelado'" class="badge badge-primary">concluída</span>
              <span *ngIf="b.payment_status === 'cancelado'" class="badge badge-destructive">cancelada</span>
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

              <!-- Avaliar arena -->
              <ng-container *ngIf="b.payment_status !== 'cancelado'">
                <button *ngIf="!isReviewed(b.id)" class="btn-review" (click)="openReviewModal(b)">
                  <span class="material-icons" style="font-size:0.9rem">star_border</span>
                  Avaliar arena
                </button>
                <div *ngIf="isReviewed(b.id)" class="reviewed-tag">
                  <span class="material-icons" style="font-size:0.9rem">star</span>
                  Avaliação enviada — obrigado!
                </div>
              </ng-container>
            </div>

          </div>
        </div>
      </div>

      <!-- ── Modal de avaliação ── -->
      <div class="modal-overlay" *ngIf="reviewingBooking" (click)="closeReviewModal()">
        <div class="modal-sheet" (click)="$event.stopPropagation()">

          <div class="text-center mb-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                 style="background:hsl(38,92%,50%,0.1)">
              <span class="material-icons" style="font-size:1.8rem;color:hsl(38,92%,50%)">star</span>
            </div>
            <h3 class="font-heading font-bold text-lg" style="color:var(--foreground)">
              {{ getArenaName(reviewingBooking.arena_id) }}
            </h3>
            <p class="text-xs mt-0.5" style="color:var(--muted-foreground)">
              {{ reviewingBooking.date | date:'dd/MM/yyyy':'UTC' }} · {{ reviewingBooking.start_hour }}–{{ reviewingBooking.end_hour }}
            </p>
          </div>

          <!-- Estrelas -->
          <p class="text-sm text-center font-semibold mb-2" style="color:var(--foreground)">Como foi sua experiência?</p>
          <div class="flex justify-center gap-1 mb-1">
            <button *ngFor="let s of [1,2,3,4,5]"
                    class="star-btn"
                    (click)="reviewStars = s"
                    (mouseover)="hoverStar = s"
                    (mouseleave)="hoverStar = 0">
              <span class="material-icons"
                    style="font-size:2.2rem;transition:color 0.1s"
                    [style.color]="(hoverStar || reviewStars) >= s ? 'hsl(38,92%,50%)' : 'var(--border)'">
                star
              </span>
            </button>
          </div>
          <p class="text-xs text-center mb-4 font-medium" style="color:var(--muted-foreground);min-height:1rem">
            {{ starLabel }}
          </p>

          <!-- Comentário -->
          <textarea [(ngModel)]="reviewComment"
                    class="input w-full mb-4"
                    style="padding:0.75rem;resize:none;min-height:80px"
                    rows="3"
                    maxlength="200"
                    placeholder="Conte como foi (opcional)..."></textarea>

          <button class="btn-confirm-cancel"
                  style="background:hsl(38,92%,50%)"
                  (click)="submitReview()"
                  [disabled]="reviewStars === 0">
            <span class="material-icons" style="font-size:1rem;vertical-align:middle;margin-right:0.3rem">send</span>
            Enviar avaliação
          </button>
          <button class="btn-back" (click)="closeReviewModal()">Pular</button>
        </div>
      </div>

    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  activeTab: 'andamento' | 'realizadas' = 'andamento';
  cancellingBooking: Booking | null = null;
  cancellationIsFree = true;
  cancellationFeePercent = 0;
  cancellationFeeAmount = 0;
  private bookings: Booking[] = [];
  private arenas: Arena[] = [];
  private courts: Court[] = [];

  // Review state
  reviewingBooking: Booking | null = null;
  reviewStars   = 0;
  hoverStar     = 0;
  reviewComment = '';
  private reviewedIds = new Set<string>(
    JSON.parse(localStorage.getItem('arenaflow_reviewed_bookings') || '[]')
  );

  get starLabel(): string {
    const s = this.hoverStar || this.reviewStars;
    return ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente!'][s] ?? '';
  }

  constructor(private data: DataService, public auth: AuthService, private toast: ToastService) {}

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
      .filter(b => b.date >= this.todayStr && b.payment_status !== 'cancelado')
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour.localeCompare(b.start_hour));
  }

  get jaRealizadas(): Booking[] {
    return this.userBookings
      .filter(b => b.date < this.todayStr || b.payment_status === 'cancelado')
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getArenaName(id: string): string {
    return this.arenas.find(a => a.id === id)?.name || 'Arena';
  }

  getCourtName(arenaId: string, courtId: string): string {
    return this.courts.find(c => c.arena_id === arenaId && c.id === courtId)?.name || 'Quadra';
  }

  isReviewed(bookingId: string): boolean {
    return this.reviewedIds.has(bookingId);
  }

  openReviewModal(b: Booking): void {
    this.reviewingBooking = b;
    this.reviewStars   = 0;
    this.hoverStar     = 0;
    this.reviewComment = '';
  }

  closeReviewModal(): void {
    this.reviewingBooking = null;
  }

  submitReview(): void {
    if (!this.reviewStars || !this.reviewingBooking) return;

    // Persiste avaliação
    const reviews: any[] = JSON.parse(localStorage.getItem('arenaflow_reviews') || '[]');
    reviews.push({
      arena_id:   this.reviewingBooking.arena_id,
      booking_id: this.reviewingBooking.id,
      stars:      this.reviewStars,
      comment:    this.reviewComment.trim(),
      date:       new Date().toISOString(),
    });
    localStorage.setItem('arenaflow_reviews', JSON.stringify(reviews));

    // Marca reserva como avaliada
    this.reviewedIds.add(this.reviewingBooking.id);
    localStorage.setItem('arenaflow_reviewed_bookings', JSON.stringify([...this.reviewedIds]));

    // Atualiza rating da arena com média de todas as avaliações dela
    const arenaReviews = reviews.filter((r: any) => r.arena_id === this.reviewingBooking!.arena_id);
    const avg = arenaReviews.reduce((s: number, r: any) => s + r.stars, 0) / arenaReviews.length;
    this.data.updateArenaRating(this.reviewingBooking.arena_id, Math.round(avg * 10) / 10, arenaReviews.length);

    this.toast.show('Obrigado pela avaliação! ⭐');
    this.closeReviewModal();
  }

  openCancelModal(b: Booking): void {
    this.cancellingBooking = b;

    // Lê a política salva pelo admin (ou usa padrão)
    const stored = localStorage.getItem('arenaflow_cancel_policy');
    const policy: { limit_hours: number; fee_percent: number } =
      stored ? JSON.parse(stored) : { limit_hours: 1, fee_percent: 0 };

    const bookingDate = new Date(`${b.date}T${b.start_hour}:00`);
    const hoursUntil = (bookingDate.getTime() - Date.now()) / 3_600_000;

    if (policy.limit_hours === 0 || hoursUntil > policy.limit_hours) {
      this.cancellationIsFree    = true;
      this.cancellationFeePercent = 0;
      this.cancellationFeeAmount  = 0;
    } else {
      this.cancellationIsFree    = false;
      this.cancellationFeePercent = policy.fee_percent;
      this.cancellationFeeAmount  = (b.paid_amount * policy.fee_percent) / 100;
    }
  }

  closeCancelModal(): void {
    this.cancellingBooking = null;
  }

  confirmCancel(): void {
    if (!this.cancellingBooking) return;
    this.data.cancelBooking(this.cancellingBooking.id);
    this.cancellingBooking = null;
  }
}
