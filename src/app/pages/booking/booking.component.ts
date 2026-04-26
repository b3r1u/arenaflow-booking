import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { BookingService, BookingResult, CancelPreview, PaymentGroup } from '../../services/booking.service';
import { ReviewService } from '../../services/review.service';

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
    .btn-back:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-confirm-cancel:disabled { opacity: 0.55; cursor: not-allowed; }
    @keyframes spin { to { transform: rotate(360deg); } }
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
                  {{ getArenaName(b) }}
                </div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                  <span class="sport-dot"></span>{{ getCourtName(b) }}
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

              <!-- Ação PIX -->
              <button *ngIf="b.payment_status === 'parcial' && !b.split_payment"
                      class="btn-primary w-full mt-3 py-2.5 text-sm">
                <span class="material-icons" style="font-size:0.9rem">pix</span>
                Pagar saldo restante via PIX
              </button>
              <button *ngIf="b.payment_status === 'pendente' && !b.split_payment"
                      class="btn-primary w-full mt-3 py-2.5 text-sm">
                <span class="material-icons" style="font-size:0.9rem">pix</span>
                Pagar agora via PIX
              </button>

              <!-- Acompanhar cotas (split payment) -->
              <button *ngIf="b.split_payment"
                      class="btn-primary w-full mt-3 py-2.5 text-sm"
                      (click)="openPaymentDetail(b)">
                <span class="material-icons" style="font-size:0.9rem">group</span>
                Acompanhar cotas dos jogadores
              </button>

              <!-- Cancelar — disponível para todos os status em andamento -->
              <button class="btn-cancel"
                      [disabled]="cancelPreviewLoading && cancellingBooking?.id === b.id"
                      (click)="openCancelModal(b)">
                <span class="material-icons" style="font-size:0.9rem"
                      [style.animation]="(cancelPreviewLoading && cancellingBooking?.id === b.id) ? 'spin 1s linear infinite' : 'none'">
                  {{ (cancelPreviewLoading && cancellingBooking?.id === b.id) ? 'refresh' : 'cancel' }}
                </span>
                {{ cancelLabel(b) }}
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Modal de confirmação de cancelamento -->
      <div class="modal-overlay" *ngIf="cancellingBooking && cancelPreview && !cancelPreviewLoading"
           (click)="closeCancelModal()">
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
            <strong style="color:var(--foreground)">{{ getArenaName(cancellingBooking) }}</strong>
            no dia <strong style="color:var(--foreground)">{{ cancellingBooking.date | date:'dd/MM/yyyy':'UTC' }}</strong>
            às <strong style="color:var(--foreground)">{{ cancellingBooking.start_hour }}</strong>.
          </p>

          <!-- Sem taxa -->
          <div *ngIf="!cancelPreview.requires_fee"
               class="rounded-xl p-3 mb-5 flex gap-2 items-start"
               style="background:hsl(152,69%,40%,0.08);border:1px solid hsl(152,69%,40%,0.2)">
            <span class="material-icons flex-shrink-0" style="font-size:1rem;color:var(--primary);margin-top:1px">check_circle</span>
            <p class="text-xs leading-relaxed" style="color:var(--primary)">
              Cancelamento <strong>sem taxa</strong> — você está dentro do prazo gratuito. O valor pago será reembolsado integralmente.
            </p>
          </div>

          <!-- Com taxa -->
          <div *ngIf="cancelPreview.requires_fee"
               class="rounded-xl p-3 mb-5 flex gap-2 items-start"
               style="background:hsl(0,84%,60%,0.08);border:1px solid hsl(0,84%,60%,0.25)">
            <span class="material-icons flex-shrink-0" style="font-size:1rem;color:hsl(0,72%,51%);margin-top:1px">warning</span>
            <p class="text-xs leading-relaxed" style="color:hsl(0,72%,40%)">
              Fora do prazo de cancelamento gratuito. Multa: <strong>R\${{ cancelPreview.fee_amount | number:'1.2-2' }}</strong>.
              Reembolso: <strong>R\${{ cancelPreview.refund_amount | number:'1.2-2' }}</strong>.
            </p>
          </div>

          <button class="btn-confirm-cancel" [disabled]="cancelling" (click)="confirmCancel()">
            <span *ngIf="cancelling" class="material-icons"
                  style="font-size:1rem;vertical-align:middle;margin-right:0.3rem;animation:spin 1s linear infinite">
              refresh
            </span>
            {{ cancelling ? 'Cancelando...' : 'Sim, cancelar reserva' }}
          </button>
          <button class="btn-back" [disabled]="cancelling" (click)="closeCancelModal()">
            Voltar
          </button>
        </div>
      </div>

      <!-- ── Modal detalhe de pagamento (split) ── -->
      <div class="modal-overlay" *ngIf="paymentDetailBooking" (click)="closePaymentDetail()">
        <div class="modal-sheet" style="max-height:90vh;overflow-y:auto;padding:1.25rem 1rem"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center gap-2 mb-4">
            <button (click)="closePaymentDetail()"
                    style="background:none;border:none;cursor:pointer;padding:0.25rem;color:var(--muted-foreground)">
              <span class="material-icons" style="font-size:1.3rem">arrow_back</span>
            </button>
            <div class="flex-1 min-w-0">
              <div class="font-heading font-bold text-sm truncate" style="color:var(--foreground)">
                {{ getArenaName(paymentDetailBooking) }}
              </div>
              <div class="text-xs" style="color:var(--muted-foreground)">
                {{ paymentDetailBooking.date | date:'dd/MM/yyyy':'UTC' }} · {{ paymentDetailBooking.start_hour }}–{{ paymentDetailBooking.end_hour }}
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="paymentDetailLoading" class="flex flex-col items-center py-8 gap-3">
            <span class="material-icons" style="font-size:2.5rem;color:var(--border);animation:spin 1s linear infinite">refresh</span>
            <p class="text-sm" style="color:var(--muted-foreground)">Carregando cotas...</p>
          </div>

          <ng-container *ngIf="!paymentDetailLoading && paymentDetailGroup">

            <!-- Progresso -->
            <div class="rounded-xl p-3 mb-4" style="background:var(--muted)">
              <div class="flex justify-between mb-2 text-sm">
                <span class="font-semibold" style="color:var(--foreground)">Divisão entre jogadores</span>
                <span class="font-semibold" style="color:var(--primary)">
                  {{ paidSplitsCount(paymentDetailGroup.splits) }} de {{ paymentDetailGroup.splits.length }} pagaram
                </span>
              </div>
              <div style="height:8px;border-radius:999px;background:var(--border);overflow:hidden">
                <div style="height:100%;border-radius:999px;background:var(--primary);transition:width 0.4s"
                     [style.width.%]="paymentDetailGroup.total_amount > 0 ? (paymentDetailGroup.paid_amount / paymentDetailGroup.total_amount) * 100 : 0">
                </div>
              </div>
              <div class="flex justify-between mt-1" style="font-size:0.72rem;color:var(--muted-foreground)">
                <span>R\${{ paymentDetailGroup.paid_amount / 100 | number:'1.2-2' }} pagos</span>
                <span>R\${{ paymentDetailGroup.total_amount / 100 | number:'1.2-2' }} total</span>
              </div>
            </div>

            <!-- Cotas -->
            <div class="space-y-3 mb-4">
              <div *ngFor="let split of paymentDetailGroup.splits"
                   class="rounded-xl p-3"
                   [style.border]="split.status === 'PAGO' ? '2px solid var(--primary)' : '1.5px solid var(--border)'"
                   style="background:var(--card)">

                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       [style.background]="split.status === 'PAGO' ? 'var(--primary)' : 'var(--muted)'"
                       [style.color]="split.status === 'PAGO' ? 'white' : 'var(--muted-foreground)'">
                    <span class="material-icons" style="font-size:1rem">{{ split.status === 'PAGO' ? 'check' : 'person' }}</span>
                  </div>
                  <span class="font-semibold text-sm flex-1" style="color:var(--foreground)">{{ split.player_name }}</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                        [style.background]="split.status === 'PAGO' ? 'hsl(152,69%,40%,0.12)' : 'var(--muted)'"
                        [style.color]="split.status === 'PAGO' ? 'var(--primary)' : 'var(--muted-foreground)'">
                    {{ split.status === 'PAGO' ? 'Pago ✓' : split.status === 'EXPIRADO' ? 'Expirado' : 'Pendente' }}
                  </span>
                </div>

                <!-- Pendente: exibe QR code e copia-e-cola -->
                <ng-container *ngIf="split.status === 'PENDENTE'">
                  <div class="text-center mb-1">
                    <span class="font-bold text-lg" style="color:var(--primary)">R\${{ split.amount / 100 | number:'1.2-2' }}</span>
                  </div>
                  <div *ngIf="split.pix_qr_code"
                       class="w-36 h-36 rounded-xl overflow-hidden mx-auto mb-2 flex items-center justify-center"
                       style="background:var(--muted)">
                    <img [src]="split.pix_qr_code" alt="QR Code PIX" style="width:100%;height:100%;object-fit:cover" />
                  </div>
                  <div *ngIf="split.pix_copy_paste"
                       class="rounded-xl p-2.5 text-xs" style="background:var(--muted)">
                    <div class="mb-1" style="color:var(--muted-foreground)">PIX Copia e Cola</div>
                    <div class="break-all mb-1" style="color:var(--foreground)">{{ split.pix_copy_paste | slice:0:50 }}...</div>
                    <button (click)="copyPixCode(split.pix_copy_paste)"
                            style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.25rem;padding:0">
                      <span class="material-icons" style="font-size:0.9rem">content_copy</span>
                      Copiar código
                    </button>
                  </div>
                </ng-container>

                <!-- Pago -->
                <div *ngIf="split.status === 'PAGO'" class="text-center py-1">
                  <span class="material-icons" style="font-size:2rem;color:var(--primary)">verified</span>
                  <div class="text-xs font-semibold mt-0.5" style="color:var(--primary)">
                    R\${{ split.amount / 100 | number:'1.2-2' }} confirmado
                  </div>
                </div>
              </div>
            </div>

            <!-- Botão cancelar -->
            <button class="btn-cancel" (click)="closePaymentDetail(); openCancelModal(paymentDetailBooking)">
              <span class="material-icons" style="font-size:0.9rem">cancel</span>
              Cancelar reserva
            </button>

          </ng-container>
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
                  {{ getArenaName(b) }}
                </div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                  <span class="sport-dot" style="background:var(--muted-foreground)"></span>
                  {{ getCourtName(b) }}
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
                <button *ngIf="!isReviewed(b)" class="btn-review" (click)="openReviewModal(b)">
                  <span class="material-icons" style="font-size:0.9rem">star_border</span>
                  Avaliar arena
                </button>
                <div *ngIf="isReviewed(b)" class="reviewed-tag">
                  <span class="material-icons" style="font-size:0.9rem">star</span>
                  Obrigado por sua avaliação!
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
              {{ getArenaName(reviewingBooking) }}
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

  // Cancel state
  cancellingBooking:   BookingResult | null   = null;
  cancelPreview:       CancelPreview | null   = null;
  cancelPreviewLoading = false;
  cancelling           = false;

  // Payment detail state (para split bookings)
  paymentDetailBooking: BookingResult | null = null;
  paymentDetailGroup:   PaymentGroup | null  = null;
  paymentDetailLoading  = false;

  private bookings: BookingResult[] = [];
  loading = false;

  // Review state
  reviewingBooking: BookingResult | null = null;
  reviewStars   = 0;
  hoverStar     = 0;
  reviewComment = '';
  private reviewedBookingIds = new Set<string>();

  get starLabel(): string {
    const s = this.hoverStar || this.reviewStars;
    return ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente!'][s] ?? '';
  }

  constructor(
    private data: DataService,
    public auth: AuthService,
    private toast: ToastService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
  ) {}

  /** Etiqueta do botão cancelar (depende do cancel preview carregado). */
  cancelLabel(b: BookingResult): string {
    // Verificamos se é o booking que está em processo de loading
    if (this.cancellingBooking?.id === b.id && this.cancelPreviewLoading) return 'Verificando...';
    if (this.cancelPreview && this.cancellingBooking?.id === b.id && this.cancelPreview.requires_fee) {
      return 'Cancelar com taxa';
    }
    return 'Cancelar reserva';
  }

  reviewSubmitting = false;

  ngOnInit() {
    this.loadBookings();
    this.reviewService.getMyReviewedBookingIds()
      .then(ids => ids.forEach(id => this.reviewedBookingIds.add(id)))
      .catch(() => {});
  }

  async loadBookings(): Promise<void> {
    this.loading = true;
    try {
      this.bookings = await this.bookingService.getMyBookings();
    } catch {
      // fallback silencioso
    } finally {
      this.loading = false;
    }
  }

  get initials(): string {
    const name = this.auth.user()?.displayName || this.auth.user()?.email || '?';
    return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('');
  }

  private get userBookings(): BookingResult[] {
    return this.bookings;
  }

  private get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get emAndamento(): BookingResult[] {
    return this.userBookings
      .filter(b => b.payment_status === 'pendente' || b.payment_status === 'parcial')
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour.localeCompare(b.start_hour));
  }

  get jaRealizadas(): BookingResult[] {
    return this.userBookings
      .filter(b => b.payment_status === 'pago' || b.payment_status === 'cancelado')
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getArenaName(b: BookingResult): string {
    return b.arena_name || 'Arena';
  }

  getCourtName(b: BookingResult): string {
    return b.court_name || 'Quadra';
  }

  isReviewed(b: BookingResult): boolean {
    return this.reviewedBookingIds.has(b.id);
  }

  openReviewModal(b: BookingResult): void {
    this.reviewingBooking = b;
    this.reviewStars   = 0;
    this.hoverStar     = 0;
    this.reviewComment = '';
  }

  closeReviewModal(): void {
    this.reviewingBooking = null;
  }

  async submitReview(): Promise<void> {
    if (!this.reviewStars || !this.reviewingBooking || this.reviewSubmitting) return;
    this.reviewSubmitting = true;

    try {
      const user    = this.auth.user();
      const userName =
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'Anônimo';

      await this.reviewService.createReview({
        establishment_id: this.reviewingBooking.arena_id,
        booking_id:       this.reviewingBooking.id,
        stars:            this.reviewStars,
        comment:          this.reviewComment.trim() || undefined,
        user_name:        userName,
      });

      // Marca reserva como avaliada na memória para atualizar a UI imediatamente
      this.reviewedBookingIds.add(this.reviewingBooking.id);

      this.toast.show('Obrigado pela avaliação! ⭐');
      this.closeReviewModal();
    } catch (err: any) {
      const msg = err?.error?.error || 'Erro ao enviar avaliação. Tente novamente.';
      this.toast.show(msg);
    } finally {
      this.reviewSubmitting = false;
    }
  }

  async openCancelModal(b: BookingResult): Promise<void> {
    this.cancellingBooking   = b;
    this.cancelPreview       = null;
    this.cancelPreviewLoading = true;

    try {
      this.cancelPreview = await this.bookingService.getCancelPreview(b.id);
    } catch (err: any) {
      const msg = err?.error?.error || 'Não foi possível verificar a política de cancelamento.';
      this.toast.show(msg);
      this.cancellingBooking   = null;
      this.cancelPreviewLoading = false;
      return;
    }

    this.cancelPreviewLoading = false;

    // Toast informativo quando há taxa
    if (this.cancelPreview.requires_fee) {
      const fee    = this.cancelPreview.fee_amount.toFixed(2).replace('.', ',');
      const refund = this.cancelPreview.refund_amount.toFixed(2).replace('.', ',');
      this.toast.show(
        `Atenção: cancelamento fora do prazo da unidade. Taxa: R$${fee}. Reembolso: R$${refund}.`
      );
    }
  }

  closeCancelModal(): void {
    this.cancellingBooking   = null;
    this.cancelPreview       = null;
    this.cancelPreviewLoading = false;
  }

  async confirmCancel(): Promise<void> {
    if (!this.cancellingBooking || this.cancelling) return;
    this.cancelling = true;
    try {
      await this.bookingService.cancelBooking(this.cancellingBooking.id);
      this.toast.show('Reserva cancelada com sucesso.');
      this.closeCancelModal();
      // Atualiza lista localmente: marca como cancelado sem recarregar tudo
      this.bookings = this.bookings.map(bk =>
        bk.id === this.cancellingBooking?.id ? { ...bk, payment_status: 'cancelado' } : bk
      );
      this.closeCancelModal();
    } catch (err: any) {
      this.toast.show(err?.error?.error || 'Erro ao cancelar. Tente novamente.');
    } finally {
      this.cancelling = false;
    }
  }

  /** Abre o painel de detalhe de pagamento (para reservas split). */
  async openPaymentDetail(b: BookingResult): Promise<void> {
    this.paymentDetailBooking = b;
    this.paymentDetailGroup   = null;
    this.paymentDetailLoading = true;
    try {
      this.paymentDetailGroup = await this.bookingService.getPaymentGroup(b.id);
    } catch {
      this.toast.show('Não foi possível carregar os dados de pagamento.');
      this.paymentDetailBooking = null;
    } finally {
      this.paymentDetailLoading = false;
    }
  }

  closePaymentDetail(): void {
    this.paymentDetailBooking = null;
    this.paymentDetailGroup   = null;
  }

  copyPixCode(code: string | null): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => this.toast.show('Código PIX copiado!'));
  }

  paidSplitsCount(splits: { status: string }[]): number {
    return splits.filter(s => s.status === 'PAGO').length;
  }
}
