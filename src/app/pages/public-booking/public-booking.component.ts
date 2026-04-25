import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';

interface PublicSplit {
  id:             string;
  player_name:    string;
  amount:         number;
  pix_qr_code:    string | null;
  pix_copy_paste: string | null;
  pix_expires_at: string | null;
  status:         'PENDENTE' | 'PAGO' | 'EXPIRADO';
}

interface PublicGroup {
  id:           string;
  payment_type: 'SPLIT' | 'DEPOSIT';
  total_amount: number;
  paid_amount:  number;
  status:       'PENDENTE' | 'PARCIAL' | 'PAGO';
  splits:       PublicSplit[];
}

interface PublicBooking {
  id:             string;
  date:           string;
  start_hour:     string;
  end_hour:       string;
  total_amount:   number;
  paid_amount:    number;
  payment_status: string;
  court_name:     string;
  sport_type:     string;
  arena: {
    name:          string;
    logo_color:    string;
    logo_url:      string | null;
    logo_initials: string | null;
  };
  payment_group: PublicGroup | null;
}

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .page { min-height: 100vh; background: var(--background); padding-bottom: 2rem; }

    .hero {
      padding: 1.5rem 1rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--card);
      margin-bottom: 1rem;
    }
    .arena-avatar {
      width: 3rem; height: 3rem; border-radius: 0.875rem;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem; color: white;
      flex-shrink: 0;
    }
    .info-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; }

    .split-card {
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 1rem;
      padding: 1.25rem;
      margin-bottom: 0.75rem;
    }
    .split-card.paid { border-color: var(--primary); border-width: 2px; }

    .player-avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 1rem;
    }

    .qr-wrap {
      width: 9rem; height: 9rem; border-radius: 0.875rem;
      overflow: hidden; margin: 0.75rem auto;
      display: flex; align-items: center; justify-content: center;
      background: var(--muted);
    }
    .copy-btn {
      display: flex; align-items: center; gap: 0.3rem;
      background: none; border: none; cursor: pointer;
      color: var(--primary); font-size: 0.78rem; font-weight: 600;
      padding: 0; margin-top: 0.5rem;
    }
    .progress-bar { height: 8px; border-radius: 999px; background: var(--muted); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 999px; background: var(--primary); transition: width 0.4s ease; }

    .brand { display: flex; align-items: center; gap: 0.5rem; justify-content: center; padding: 1.5rem 0 0.5rem; }
  `],
  template: `
    <div class="page">

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center" style="min-height:60vh">
        <span class="material-icons mb-3" style="font-size:3rem;color:var(--border);animation:spin 1s linear infinite">refresh</span>
        <p style="color:var(--muted-foreground);font-size:0.9rem">Carregando reserva...</p>
      </div>

      <!-- Erro -->
      <div *ngIf="!loading && error" class="flex flex-col items-center justify-center" style="min-height:60vh;padding:2rem">
        <span class="material-icons mb-3" style="font-size:3rem;color:var(--border)">search_off</span>
        <p class="font-bold mb-1" style="color:var(--foreground)">Reserva não encontrada</p>
        <p style="color:var(--muted-foreground);font-size:0.85rem;text-align:center">{{ error }}</p>
      </div>

      <ng-container *ngIf="!loading && booking">

        <!-- Hero da reserva -->
        <div class="hero">
          <div style="max-width:480px;margin:0 auto">
            <div class="flex items-center gap-3 mb-3">
              <div class="arena-avatar" [style.background]="booking.arena.logo_color">
                <img *ngIf="booking.arena.logo_url" [src]="booking.arena.logo_url"
                     style="width:100%;height:100%;object-fit:cover;border-radius:inherit" alt="">
                <span *ngIf="!booking.arena.logo_url">{{ booking.arena.logo_initials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm" style="color:var(--foreground)">{{ booking.arena.name }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ booking.court_name }}</div>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-full"
                    [style.background]="booking.payment_status === 'PAGO' ? 'hsl(152,69%,40%,0.12)' : 'hsl(45,93%,47%,0.12)'"
                    [style.color]="booking.payment_status === 'PAGO' ? 'var(--primary)' : '#b45309'">
                {{ statusLabel(booking.payment_status) }}
              </span>
            </div>
            <div class="flex gap-3 text-xs" style="color:var(--muted-foreground)">
              <span class="info-row">
                <span class="material-icons" style="font-size:0.85rem">calendar_today</span>
                {{ booking.date | date:'dd/MM/yyyy':'UTC' }}
              </span>
              <span class="info-row">
                <span class="material-icons" style="font-size:0.85rem">schedule</span>
                {{ booking.start_hour }} – {{ booking.end_hour }}
              </span>
              <span class="info-row">
                <span class="material-icons" style="font-size:0.85rem">payments</span>
                R\${{ booking.total_amount | number:'1.2-2' }}
              </span>
            </div>
          </div>
        </div>

        <div style="max-width:480px;margin:0 auto;padding:0 1rem">

          <!-- Sem grupo de pagamento -->
          <div *ngIf="!booking.payment_group" class="text-center" style="padding:3rem 0">
            <span class="material-icons mb-3 block" style="font-size:3rem;color:var(--border)">payment</span>
            <p style="color:var(--muted-foreground)">Nenhum pagamento configurado para esta reserva.</p>
          </div>

          <ng-container *ngIf="booking.payment_group as group">

            <!-- Progresso geral -->
            <div style="background:var(--card);border:1.5px solid var(--border);border-radius:1rem;padding:1rem;margin-bottom:1rem">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-sm" style="color:var(--foreground)">
                  {{ group.payment_type === 'SPLIT' ? 'Divisão entre jogadores' : 'Sinal (50%)' }}
                </span>
                <span class="text-xs font-semibold" style="color:var(--primary)">
                  {{ paidCount(group.splits) }} de {{ group.splits.length }} pag{{ group.splits.length === 1 ? 'ou' : 'aram' }}
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="progressPercent(group)"></div>
              </div>
              <div class="flex justify-between mt-1" style="font-size:0.72rem;color:var(--muted-foreground)">
                <span>R\${{ group.paid_amount / 100 | number:'1.2-2' }} pagos</span>
                <span>R\${{ group.total_amount / 100 | number:'1.2-2' }} total</span>
              </div>
            </div>

            <!-- Cotas por jogador -->
            <div *ngFor="let split of group.splits">
              <div class="split-card" [class.paid]="split.status === 'PAGO'">

                <!-- Header da cota -->
                <div class="flex items-center gap-2 mb-3">
                  <div class="player-avatar"
                       [style.background]="split.status === 'PAGO' ? 'var(--primary)' : 'var(--muted)'"
                       [style.color]="split.status === 'PAGO' ? 'white' : 'var(--muted-foreground)'">
                    <span class="material-icons" style="font-size:1.1rem">{{ split.status === 'PAGO' ? 'check' : 'person' }}</span>
                  </div>
                  <span class="font-semibold text-sm flex-1" style="color:var(--foreground)">{{ split.player_name }}</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                        [style.background]="split.status === 'PAGO' ? 'hsl(152,69%,40%,0.12)' : 'var(--muted)'"
                        [style.color]="split.status === 'PAGO' ? 'var(--primary)' : 'var(--muted-foreground)'">
                    {{ split.status === 'PAGO' ? 'Pago ✓' : split.status === 'EXPIRADO' ? 'Expirado' : 'Pendente' }}
                  </span>
                </div>

                <!-- QR Code (pendente) -->
                <ng-container *ngIf="split.status === 'PENDENTE'">
                  <div class="text-center mb-1" style="font-size:0.75rem;color:var(--muted-foreground)">
                    Valor da cota
                  </div>
                  <div class="text-center mb-3">
                    <span class="font-bold text-xl" style="color:var(--primary)">R\${{ split.amount / 100 | number:'1.2-2' }}</span>
                  </div>

                  <div class="qr-wrap">
                    <img *ngIf="split.pix_qr_code"
                         [src]="split.pix_qr_code"
                         alt="QR Code PIX" style="width:100%;height:100%;object-fit:cover" />
                    <span *ngIf="!split.pix_qr_code" class="material-icons" style="font-size:3.5rem;color:var(--muted-foreground)">qr_code_2</span>
                  </div>

                  <div *ngIf="split.pix_copy_paste" style="background:var(--muted);border-radius:0.75rem;padding:0.75rem;margin-top:0.5rem">
                    <div style="font-size:0.72rem;color:var(--muted-foreground);margin-bottom:0.25rem">PIX Copia e Cola</div>
                    <div style="font-size:0.72rem;color:var(--foreground);word-break:break-all">
                      {{ split.pix_copy_paste | slice:0:64 }}...
                    </div>
                    <button class="copy-btn" (click)="copyPix(split.pix_copy_paste)">
                      <span class="material-icons" style="font-size:0.9rem">content_copy</span>
                      Copiar código PIX
                    </button>
                  </div>
                </ng-container>

                <!-- Pago -->
                <div *ngIf="split.status === 'PAGO'" class="text-center" style="padding:0.5rem 0">
                  <span class="material-icons" style="font-size:2.5rem;color:var(--primary)">verified</span>
                  <div class="font-semibold text-sm mt-1" style="color:var(--primary)">Pagamento confirmado</div>
                  <div style="font-size:0.8rem;color:var(--muted-foreground);margin-top:0.25rem">R\${{ split.amount / 100 | number:'1.2-2' }}</div>
                </div>

              </div>
            </div>

          </ng-container>

          <!-- Rodapé ArenaFlow -->
          <div class="brand">
            <div style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:var(--primary);display:flex;align-items:center;justify-content:center">
              <span class="material-icons" style="font-size:1rem;color:white">sports_volleyball</span>
            </div>
            <span class="font-bold text-sm" style="color:var(--foreground)">ArenaFlow</span>
          </div>
          <p style="text-align:center;font-size:0.7rem;color:var(--muted-foreground);margin-top:0.25rem">
            Reservas de quadras esportivas
          </p>
        </div>

      </ng-container>
    </div>
  `
})
export class PublicBookingComponent implements OnInit, OnDestroy {
  @Input() bookingId!: string;

  booking: PublicBooking | null = null;
  loading = true;
  error: string | null = null;

  private pollInterval: any = null;

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.api.get<{ booking: PublicBooking }>(`/reserva/${this.bookingId}`)
      );
      this.booking = res.booking;
      this.startPolling();
    } catch {
      this.error = 'Verifique o link e tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(async () => {
      try {
        const res = await firstValueFrom(
          this.api.getSilent<{ booking: PublicBooking }>(`/reserva/${this.bookingId}`)
        );
        const fresh = res.booking;

        // Toast por cota recém-paga
        if (this.booking?.payment_group && fresh.payment_group) {
          for (const ns of fresh.payment_group.splits) {
            const ps = this.booking.payment_group.splits.find(s => s.id === ns.id);
            if (ps && ps.status !== 'PAGO' && ns.status === 'PAGO') {
              this.toast.show(`✅ ${ns.player_name} pagou a cota`);
            }
          }
        }

        this.booking = fresh;

        // Se totalmente pago, encerra polling
        if (fresh.payment_group?.status === 'PAGO' || fresh.payment_status === 'PAGO') {
          this.stopPolling();
        }
      } catch { /* ignora */ }
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDENTE:   'Pendente',
      PARCIAL:    'Parcial',
      SINAL_PAGO: 'Sinal pago',
      PAGO:       'Pago',
      CANCELADO:  'Cancelado',
    };
    return map[status] ?? status;
  }

  paidCount(splits: PublicSplit[]): number {
    return splits.filter(s => s.status === 'PAGO').length;
  }

  progressPercent(group: PublicGroup): number {
    return group.total_amount > 0
      ? Math.min(100, (group.paid_amount / group.total_amount) * 100)
      : 0;
  }

  copyPix(code: string | null): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.toast.show('Código PIX copiado!');
    });
  }
}
