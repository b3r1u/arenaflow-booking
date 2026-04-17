import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { Arena, Booking, Court } from '../../models/models';
import { BookingService, BookingResult } from '../../services/booking.service';

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
    .hero-banner-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      filter: blur(6px) brightness(0.85) saturate(1.2);
      transform: scale(1.08);
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

    /* ── Reviews carousel ── */
    .reviews-carousel {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0.25rem 0 0.5rem;
    }
    .reviews-carousel::-webkit-scrollbar { display: none; }
    .review-card {
      min-width: 210px;
      max-width: 210px;
      flex-shrink: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.875rem;
      padding: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .review-comment {
      font-size: 0.75rem;
      color: var(--foreground);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .review-meta {
      font-size: 0.68rem;
      color: var(--muted-foreground);
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    /* ── Animação bola confirmação ── */
    .ball-confirmed-wrapper {
      position: relative;
      width: clamp(120px, 40vw, 160px);
      height: clamp(120px, 40vw, 160px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ball-confirmed-glow {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: radial-gradient(circle, hsl(152,69%,40%,0.22) 0%, transparent 70%);
      animation: ball-pulse 2s ease-in-out infinite;
    }
    .ball-confirmed {
      width: 100%;
      height: 100%;
      animation: ball-spin 3s linear infinite, ball-bounce 1.8s ease-in-out infinite;
      filter: drop-shadow(0 6px 16px hsl(152,69%,40%,0.35));
    }
    .ball-confirmed-check {
      position: absolute;
      bottom: -4px;
      right: -4px;
      font-size: 2rem;
      color: var(--primary);
      background: var(--card);
      border-radius: 50%;
      animation: check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes ball-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes ball-bounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50%       { transform: translateY(-12px) rotate(180deg); }
    }
    @keyframes ball-pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50%       { opacity: 1;   transform: scale(1.1); }
    }
    @keyframes check-pop {
      from { transform: scale(0) rotate(-45deg); opacity: 0; }
      to   { transform: scale(1) rotate(0deg);   opacity: 1; }
    }
  `],
  template: `
    <div>

      <!-- ═══════ HERO ═══════ -->
      <div class="arena-hero"
           [style.background]="'linear-gradient(150deg,' + arena.logo_color + '80 0%,' + arena.logo_color + '30 100%)'">

        <!-- Banner photo (logo como background desfocado) -->
        <img *ngIf="arena.logo_url"
             class="hero-banner-img"
             [src]="arena.logo_url"
             alt="" />

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
          <div class="hero-avatar" [style.background]="arena.logo_color">
            <img *ngIf="arena.logo_url"
                 [src]="arena.logo_url"
                 alt="Logo"
                 style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />
            <span *ngIf="!arena.logo_url">{{ arena.logo_initials }}</span>
          </div>
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
        <a *ngIf="arena.address"
           [href]="mapsUrl()"
           target="_blank" rel="noopener noreferrer"
           class="info-chip"
           style="text-decoration:none;cursor:pointer">
          <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">near_me</span>
          {{ arena.address }}{{ arena.neighborhood ? ', ' + arena.neighborhood : '' }}
        </a>
        <span *ngFor="let s of arena.sports" class="info-chip sport-chip">{{ s }}</span>
      </div>

      <!-- ═══════ CONTENT ═══════ -->
      <div class="px-4 pb-24" style="max-width:640px;margin:0 auto">

        <!-- Description -->
        <p class="text-sm py-4" style="color:var(--muted-foreground);border-bottom:1px solid var(--border)">
          {{ arena.description }}
        </p>

        <!-- ═══════ AVALIAÇÕES (carrossel — só step 1) ═══════ -->
        <div *ngIf="step === 1 && arenaReviews.length > 0"
             class="py-4" style="border-bottom:1px solid var(--border)">

          <!-- Header da seção -->
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-heading font-semibold text-sm" style="color:var(--foreground)">
              Avaliações dos clientes
            </h3>
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full"
                 style="background:hsl(38,92%,50%,0.1)">
              <span class="material-icons" style="font-size:0.8rem;color:hsl(38,92%,50%)">star</span>
              <span class="text-xs font-bold" style="color:hsl(38,92%,35%)">{{ arenaAvgRating }}</span>
              <span class="text-xs" style="color:hsl(38,92%,45%)">({{ arenaReviews.length }})</span>
            </div>
          </div>

          <!-- Carrossel -->
          <div class="reviews-carousel">
            <div *ngFor="let r of arenaReviews" class="review-card">

              <!-- Estrelas -->
              <div class="flex gap-0.5">
                <span *ngFor="let s of [1,2,3,4,5]"
                      class="material-icons"
                      style="font-size:0.9rem"
                      [style.color]="s <= r.stars ? 'hsl(38,92%,50%)' : 'var(--border)'">star</span>
              </div>

              <!-- Comentário -->
              <p *ngIf="r.comment" class="review-comment">"{{ r.comment }}"</p>
              <p *ngIf="!r.comment" class="review-comment" style="color:var(--muted-foreground);font-style:italic">
                Sem comentário
              </p>

              <!-- Meta -->
              <div class="review-meta">
                <span class="flex items-center gap-0.5">
                  <span class="material-icons" style="font-size:0.7rem">verified_user</span>
                  Cliente verificado
                </span>
                <span>{{ r.date | date:'dd/MM/yy' }}</span>
              </div>

            </div>
          </div>
        </div>

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
                  <option *ngFor="let h of availableStartHours" [value]="h">{{ h }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Fim</label>
                <select class="select" [(ngModel)]="form.end_hour" (ngModelChange)="onSlotChange()">
                  <option value="" disabled>Selecione um horário de Fim</option>
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

          <button class="btn-primary w-full py-3" (click)="goToStep3()"
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
            <!-- Nome completo (pré-preenchido da conta) -->
            <div>
              <label class="block text-sm font-semibold mb-1" style="color:var(--foreground)">Nome completo *</label>
              <div class="text-xs mb-2" style="color:var(--muted-foreground)" *ngIf="auth.user()?.email">
                <span class="material-icons" style="font-size:0.75rem;vertical-align:middle">info</span>
                Baseado na conta: {{ auth.user()?.email }}
              </div>
              <div style="position:relative">
                <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">person</span>
                <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_name" placeholder="Seu nome completo">
              </div>
            </div>

            <!-- Telefone -->
            <div>
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Telefone (WhatsApp)</label>
              <div style="position:relative">
                <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">phone</span>
                <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_phone"
                       placeholder="(00) 00000-0000" maxlength="15" (input)="onPhoneInput($event)">
              </div>
              <p *ngIf="!phoneValid && form.client_phone.length > 0" class="text-xs mt-1" style="color:var(--destructive)">Número inválido</p>
              <p *ngIf="!phoneValid && form.client_phone.length === 0" class="text-xs mt-1" style="color:var(--muted-foreground)">* Obrigatório para selecionar forma de pagamento</p>
            </div>

            <!-- CPF -->
            <div>
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">CPF</label>
              <div style="position:relative">
                <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">badge</span>
                <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_document"
                       placeholder="000.000.000-00" maxlength="14" (input)="onCpfInput($event)">
              </div>
              <p *ngIf="!cpfValid && form.client_document.length > 0" class="text-xs mt-1" style="color:var(--destructive)">CPF inválido</p>
              <p *ngIf="form.client_document.length === 0" class="text-xs mt-1" style="color:var(--muted-foreground)">* Necessário para geração do QR Code PIX</p>
            </div>
            <!-- Dividir pagamento — só disponível no pagamento total -->
            <div style="border-top:1px solid var(--border);padding-top:1rem" *ngIf="form.payment_option === '100'">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm font-semibold" style="color:var(--foreground)">Dividir pagamento?</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">Divide o valor entre os jogadores</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" [(ngModel)]="form.split_payment">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div *ngIf="form.split_payment" class="rounded-2xl p-4" style="background:var(--muted)">
                <div class="text-xs text-center font-semibold mb-3" style="color:var(--muted-foreground)">Nº DE JOGADORES</div>
                <div class="flex items-center justify-between gap-4">
                  <button (click)="form.num_players = form.num_players > 2 ? form.num_players - 1 : 2"
                          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                          style="background:var(--card);border:1.5px solid var(--border);color:var(--foreground)">−</button>
                  <div class="text-center flex-1">
                    <div class="font-heading font-bold text-3xl" style="color:var(--foreground)">{{ form.num_players }}</div>
                    <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">jogadores</div>
                  </div>
                  <button (click)="form.num_players = form.num_players < 20 ? form.num_players + 1 : 20"
                          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                          style="background:var(--primary);color:white;border:none">+</button>
                </div>
                <div class="mt-3 rounded-xl p-2.5 text-center" style="background:hsl(152,69%,40%,0.1)">
                  <span class="font-heading font-bold" style="color:var(--primary)">R\${{ perPlayerAmount | number:'1.2-2' }}</span>
                  <span class="text-xs ml-1" style="color:var(--muted-foreground)">por jogador</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Opção de pagamento: 50% ou 100% -->
          <h3 class="font-heading font-semibold text-sm mb-3" style="color:var(--foreground)">Como deseja pagar?</h3>
          <div class="space-y-2 mb-4">
            <!-- 50% -->
            <div (click)="phoneValid && (form.payment_option = '50') && (form.split_payment = false)" class="card p-4 flex items-center gap-3"
                 [class.cursor-pointer]="phoneValid" [class.opacity-40]="!phoneValid" [class.pointer-events-none]="!phoneValid"
                 [style]="form.payment_option === '50' ? 'border-color:var(--primary);border-width:2px' : 'border-width:1.5px'">
              <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-bold text-sm"
                   [style]="form.payment_option === '50' ? 'background:var(--primary);color:white' : 'background:var(--muted);color:var(--muted-foreground)'">50%</div>
              <div class="flex-1">
                <div class="font-semibold text-sm" style="color:var(--foreground)">Reservar com entrada</div>
                <div class="text-xs" style="color:var(--muted-foreground)">Pague <strong style="color:var(--primary)">R\${{ form.total_amount / 2 | number:'1.2-2' }}</strong> agora e confirme o horário</div>
              </div>
              <span class="material-icons" style="font-size:1.1rem" [style.color]="form.payment_option === '50' ? 'var(--primary)' : 'var(--border)'">
                {{ form.payment_option === '50' ? 'radio_button_checked' : 'radio_button_unchecked' }}
              </span>
            </div>
            <!-- 100% -->
            <div (click)="phoneValid && (form.payment_option = '100')" class="card p-4 flex items-center gap-3"
                 [class.cursor-pointer]="phoneValid" [class.opacity-40]="!phoneValid" [class.pointer-events-none]="!phoneValid"
                 [style]="form.payment_option === '100' ? 'border-color:var(--primary);border-width:2px' : 'border-width:1.5px'">
              <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-bold text-sm"
                   [style]="form.payment_option === '100' ? 'background:var(--primary);color:white' : 'background:var(--muted);color:var(--muted-foreground)'">100%</div>
              <div class="flex-1">
                <div class="font-semibold text-sm" style="color:var(--foreground)">Garantir totalmente</div>
                <div class="text-xs" style="color:var(--muted-foreground)">Pague <strong style="color:var(--primary)">R\${{ form.total_amount | number:'1.2-2' }}</strong> e reserve o horário para você</div>
              </div>
              <span class="material-icons" style="font-size:1.1rem" [style.color]="form.payment_option === '100' ? 'var(--primary)' : 'var(--border)'">
                {{ form.payment_option === '100' ? 'radio_button_checked' : 'radio_button_unchecked' }}
              </span>
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
              <div class="flex justify-between pt-2" style="border-top:1px solid var(--border)">
                <span style="color:var(--muted-foreground)">Total da reserva</span>
                <span class="font-medium" style="color:var(--foreground)">R\${{ form.total_amount }}</span>
              </div>
              <div class="flex justify-between font-heading font-bold text-base">
                <span style="color:var(--foreground)">A pagar agora</span>
                <span style="color:var(--primary)">R\${{ paidAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <button class="btn-primary w-full py-3" (click)="confirm()" [disabled]="!form.client_name.trim() || !phoneValid || !cpfValid || confirming">
            <span *ngIf="confirming" class="material-icons" style="font-size:1rem;animation:spin 1s linear infinite">refresh</span>
            <span *ngIf="!confirming" class="material-icons" style="font-size:1rem">{{ form.split_payment ? 'group' : 'pix' }}</span>
            {{ confirming ? 'Criando reserva...' : (form.payment_option === '50' ? 'Pagar entrada via PIX' : (form.split_payment ? 'Criar cobrança' : 'Pagar total via PIX')) }}
          </button>
        </div>

        <!-- ══ STEP 4: Confirmação + PIX ══ -->
        <div *ngIf="step === 4" class="pt-6">

          <!-- ── Fluxo normal (sem split) ── -->
          <ng-container *ngIf="!confirmedBooking?.split_payment">
            <div class="text-center mb-6">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   [style]="paymentConfirmed ? 'background:hsl(152,69%,40%,0.18)' : 'background:hsl(152,69%,40%,0.12)'">
                <span class="material-icons" style="font-size:2rem;color:var(--primary)">
                  {{ paymentConfirmed ? 'verified' : 'check_circle' }}
                </span>
              </div>
              <h2 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">
                {{ paymentConfirmed ? 'Pagamento confirmado!' : 'Reserva criada!' }}
              </h2>
              <p class="text-sm" style="color:var(--muted-foreground)">
                {{ paymentConfirmed ? 'Sua quadra está garantida. Até lá! 🎉' : (confirmedBooking?.payment_option === '100' ? 'Pague o valor total via PIX para garantir seu horário' : 'Pague a entrada via PIX para confirmar seu horário') }}
              </p>
            </div>

            <div class="card p-5 mb-4 text-left">
              <!-- Animação de bola após pagamento confirmado -->
              <div *ngIf="paymentConfirmed" class="flex flex-col items-center justify-center mb-5" style="padding:1rem 0">
                <div class="ball-confirmed-wrapper">
                  <div class="ball-confirmed-glow"></div>

                  <!-- Futevôlei / Vôlei / Futebol / Ambos → bola de futebol -->
                  <img *ngIf="selectedCourt?.sport_type !== 'beach tennis'"
                       src="assets/bola-de-futebol.png"
                       alt="bola"
                       class="ball-confirmed" />

                  <!-- Beach Tennis → raquete -->
                  <img *ngIf="selectedCourt?.sport_type === 'beach tennis'"
                       src="assets/remo.png"
                       alt="raquete beach tennis"
                       class="ball-confirmed" />

                </div>
                <p class="text-xs mt-3 font-semibold" style="color:var(--primary)">Pagamento recebido ✓</p>
              </div>

              <!-- QR Code real do Pagar.me (só enquanto aguarda pagamento) -->
              <div *ngIf="!paymentConfirmed" class="w-44 h-44 rounded-2xl mx-auto mb-5 overflow-hidden flex items-center justify-center"
                   style="background:var(--muted)">
                <img *ngIf="confirmedBooking?.pix_qr_code_url"
                     [src]="confirmedBooking!.pix_qr_code_url"
                     alt="QR Code PIX" style="width:100%;height:100%;object-fit:cover" />
                <span *ngIf="!confirmedBooking?.pix_qr_code_url"
                      class="material-icons" style="font-size:4rem;color:var(--muted-foreground)">qr_code_2</span>
              </div>
              <!-- Copia e cola (só enquanto aguarda) -->
              <div *ngIf="!paymentConfirmed && confirmedBooking?.pix_qr_code"
                   class="p-3.5 rounded-xl mb-4" style="background:var(--muted)">
                <div class="text-xs mb-1" style="color:var(--muted-foreground)">PIX Copia e Cola</div>
                <div class="font-mono text-xs break-all mb-2" style="color:var(--foreground)">
                  {{ confirmedBooking!.pix_qr_code | slice:0:60 }}...
                </div>
                <button class="btn-ghost w-full py-1.5 text-xs"
                        (click)="copyPix()">
                  <span class="material-icons" style="font-size:0.85rem">content_copy</span>
                  Copiar código PIX
                </button>
              </div>
              <div *ngIf="!paymentConfirmed && !confirmedBooking?.pix_qr_code"
                   class="p-3.5 rounded-xl mb-4 text-center" style="background:var(--muted)">
                <div class="text-xs mb-1" style="color:var(--muted-foreground)">Chave PIX</div>
                <div class="font-heading font-bold text-sm" style="color:var(--foreground)">{{ arena.phone }}</div>
              </div>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span style="color:var(--muted-foreground)">Arena</span>
                  <span class="font-medium" style="color:var(--foreground)">{{ arena.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span style="color:var(--muted-foreground)">Total da reserva</span>
                  <span class="font-medium" style="color:var(--foreground)">R\${{ confirmedBooking?.total_amount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between font-heading font-bold text-base pt-1" style="border-top:1px solid var(--border)">
                  <span style="color:var(--foreground)">
                    {{ confirmedBooking?.payment_option === '50' ? 'Entrada (50%)' : 'Valor a pagar' }}
                  </span>
                  <span style="color:var(--primary)">R\${{ confirmedBooking?.paid_amount | number:'1.2-2' }}</span>
                </div>
                <div *ngIf="confirmedBooking?.payment_option === '50'" class="flex justify-between text-xs pt-0.5">
                  <span style="color:var(--muted-foreground)">Saldo restante no dia</span>
                  <span style="color:var(--muted-foreground)">R\${{ (confirmedBooking?.total_amount || 0) - (confirmedBooking?.paid_amount || 0) | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between pt-1">
                  <span style="color:var(--muted-foreground)">Status</span>
                  <span class="badge" [ngClass]="paymentConfirmed ? 'badge-primary' : 'badge-accent'">
                    {{ paymentConfirmed ? 'pago' : (confirmedBooking?.payment_option === '100' ? 'aguardando pagamento total' : 'aguardando entrada') }}
                  </span>
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
          </ng-container>

          <!-- ── Fluxo split payment ── -->
          <ng-container *ngIf="confirmedBooking?.split_payment">
            <div class="text-center mb-6">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style="background:hsl(152,69%,40%,0.12)">
                <span class="material-icons" style="font-size:2rem;color:var(--primary)">group</span>
              </div>
              <h2 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Cobrança criada!</h2>
              <p class="text-sm" style="color:var(--muted-foreground)">
                Pague sua parte e compartilhe o link com os demais jogadores
              </p>
            </div>

            <!-- QR Code — parte do usuário atual -->
            <div class="card p-5 mb-3 text-left">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons" style="font-size:1rem;color:var(--primary)">pix</span>
                <span class="font-heading font-semibold text-sm" style="color:var(--foreground)">Seu pagamento</span>
                <span class="badge badge-primary ml-auto">1 de {{ confirmedBooking?.num_players }} jogadores</span>
              </div>

              <div class="w-40 h-40 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                   style="background:var(--muted)">
                <span class="material-icons" style="font-size:3.5rem;color:var(--muted-foreground)">qr_code_2</span>
              </div>

              <div class="p-3 rounded-xl mb-4 text-center" style="background:var(--muted)">
                <div class="text-xs mb-0.5" style="color:var(--muted-foreground)">Chave PIX</div>
                <div class="font-heading font-bold text-sm" style="color:var(--foreground)">{{ arena.phone }}</div>
              </div>

              <div class="flex justify-between items-center text-sm mb-1">
                <span style="color:var(--muted-foreground)">Sua parte</span>
                <span class="font-heading font-bold" style="color:var(--primary)">
                  R\${{ splitPerPlayer | number:'1.2-2' }}
                </span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span style="color:var(--muted-foreground)">Total da reserva</span>
                <span style="color:var(--muted-foreground)">R\${{ confirmedBooking?.total_amount | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Progresso da cobrança -->
            <div class="card p-4 mb-3">
              <div class="flex items-center justify-between mb-3">
                <span class="font-heading font-semibold text-sm" style="color:var(--foreground)">Progresso da cobrança</span>
                <span class="text-xs font-semibold" style="color:var(--primary)">
                  {{ splitPaidCount }} de {{ confirmedBooking?.num_players }} pagaram
                </span>
              </div>

              <!-- Barra de progresso -->
              <div class="rounded-full overflow-hidden mb-2" style="height:10px;background:var(--muted)">
                <div class="h-full rounded-full transition-all duration-500"
                     style="background:var(--primary)"
                     [style.width.%]="splitProgressPercent">
                </div>
              </div>

              <div class="flex justify-between text-xs">
                <span style="color:var(--muted-foreground)">
                  R\${{ splitCollectedAmount | number:'1.2-2' }} coletados
                </span>
                <span style="color:var(--muted-foreground)">
                  R\${{ confirmedBooking?.total_amount | number:'1.2-2' }} total
                </span>
              </div>

              <!-- Avatares dos jogadores -->
              <div class="flex items-center gap-1.5 mt-3 flex-wrap">
                <div *ngFor="let p of splitPlayersArray; let i = index"
                     class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                     [style.background]="i < splitPaidCount ? 'var(--primary)' : 'var(--muted)'"
                     [style.color]="i < splitPaidCount ? 'white' : 'var(--muted-foreground)'"
                     [title]="i < splitPaidCount ? 'Pago' : 'Pendente'">
                  <span class="material-icons" style="font-size:0.9rem">
                    {{ i < splitPaidCount ? 'check' : 'person' }}
                  </span>
                </div>
                <span class="text-xs ml-1" style="color:var(--muted-foreground)">
                  {{ splitPaidCount === confirmedBooking?.num_players ? 'Todos pagaram!' : ((confirmedBooking?.num_players || 0) - splitPaidCount) + ' pendentes' }}
                </span>
              </div>
            </div>

            <!-- Compartilhar link — some quando todos pagaram -->
            <ng-container *ngIf="splitPaidCount < (confirmedBooking?.num_players || 0)">
              <button class="btn-primary w-full py-3 mb-2" (click)="sharePaymentLink()">
                <span class="material-icons" style="font-size:1rem">share</span>
                Compartilhar link de cobrança
              </button>
              <p class="text-xs text-center mb-4" style="color:var(--muted-foreground)">
                Envie para os demais jogadores pagarem a própria parte
              </p>
            </ng-container>

            <!-- Simular pagamento (demo) -->
            <div *ngIf="splitPaidCount < (confirmedBooking?.num_players || 0)"
                 class="rounded-xl p-3 mb-4 text-center"
                 style="background:var(--muted);border:1px dashed var(--border)">
              <p class="text-xs mb-2" style="color:var(--muted-foreground)">Ambiente de demonstração</p>
              <button class="text-xs font-semibold px-4 py-1.5 rounded-lg"
                      style="background:var(--card);border:1px solid var(--border);color:var(--foreground)"
                      (click)="simulateSplitPayment()">
                <span class="material-icons" style="font-size:0.8rem;vertical-align:middle">bolt</span>
                Simular pagamento recebido
              </button>
            </div>

            <div class="flex gap-2">
              <button class="btn-outline flex-1" (click)="resetToArena()">
                <span class="material-icons" style="font-size:1rem">add</span>
                Nova reserva
              </button>
              <button class="btn-outline flex-1" (click)="back.emit()">
                <span class="material-icons" style="font-size:1rem">search</span>
                Outras arenas
              </button>
            </div>
          </ng-container>

        </div>

      </div>
    </div>
  `
})
export class ArenaDetailComponent implements OnInit, OnDestroy {
  @Input() arena!: Arena;
  @Output() back = new EventEmitter<void>();

  courts: Court[] = [];
  selectedCourt: Court | null = null;
  step = 1;
  slotConflict = false;
  durationHours = 0;
  confirmedBooking: BookingResult | null = null;
  confirming = false;
  paymentConfirmed = false;
  private pollInterval: any = null;

  // Split payment tracking
  splitCollectedAmount = 0;
  splitPaidCount = 0;

  // Reviews
  arenaReviews: any[] = [];

  form = this.emptyForm();
  private lastDate = this.form.date;

  hours    = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);
  get endHours()        { return this.hours.filter(h => parseInt(h) > parseInt(this.form.start_hour)); }
  get todayStr()        { return new Date().toISOString().split('T')[0]; }
  get availableCourts() { return this.courts.filter(c => c.status !== 'bloqueada'); }
  get perPlayerAmount() { return this.form.num_players > 1 ? this.form.total_amount / this.form.num_players : this.form.total_amount; }

  get splitPerPlayer()       { return (this.confirmedBooking?.total_amount || 0) / (this.confirmedBooking?.num_players || 1); }
  get splitProgressPercent() { return Math.min(100, (this.splitCollectedAmount / (this.confirmedBooking?.total_amount || 1)) * 100); }
  get splitPlayersArray()    { return Array.from({ length: this.confirmedBooking?.num_players || 0 }); }

  get availableStartHours() {
    if (this.form.date !== this.todayStr) return this.hours;
    const now = new Date();
    const currentHour = now.getHours();
    return this.hours.filter(h => parseInt(h) > currentHour);
  }

  constructor(private data: DataService, private toast: ToastService, public auth: AuthService, private userProfile: UserProfileService, private bookingService: BookingService) {}

  get arenaAvgRating(): number {
    if (!this.arenaReviews.length) return 0;
    const avg = this.arenaReviews.reduce((s: number, r: any) => s + r.stars, 0) / this.arenaReviews.length;
    return Math.round(avg * 10) / 10;
  }

  ngOnDestroy(): void {
    this.stopPaymentPolling();
  }

  ngOnInit() {
    this.courts = this.arena.courts ?? [];
    const all: any[] = JSON.parse(localStorage.getItem('arenaflow_reviews') || '[]');
    this.arenaReviews = all
      .filter((r: any) => r.arena_id === this.arena.id)
      .sort((a: any, b: any) => b.date.localeCompare(a.date));
  }

  emptyForm() {
    const now = new Date();
    const currentHour = now.getHours();
    const firstAvailable = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].find(h => h > currentHour);
    const defaultStart = firstAvailable != null
      ? `${firstAvailable.toString().padStart(2, '0')}:00`
      : '07:00';
    return {
      court_id: '', date: now.toISOString().split('T')[0],
      start_hour: defaultStart, end_hour: '',
      client_name: '', client_phone: '', client_document: '',
      num_players: 2, split_payment: false, total_amount: 0,
      payment_option: '50' as '50' | '100'
    };
  }

  goToStep3() {
    const profile = this.userProfile.getProfile();
    const user    = this.auth.user();
    if (!this.form.client_name.trim())
      this.form.client_name = profile.name || user?.displayName || '';
    if (!this.form.client_phone.trim())
      this.form.client_phone = profile.phone || '';
    this.step = 3;
  }

  get phoneValid(): boolean {
    return this.form.client_phone.replace(/\D/g, '').length >= 10;
  }

  get cpfValid(): boolean {
    return this.form.client_document.replace(/\D/g, '').length === 11;
  }

  get paidAmount() {
    return this.form.payment_option === '50'
      ? this.form.total_amount / 2
      : this.form.total_amount;
  }

  selectCourt(court: Court) {
    this.form.court_id = court.id;
    this.selectedCourt = court;
    this.calcTotal();
    this.step = 2;
  }

  onSlotChange() {
    // Ao mudar a data, recalcula o start_hour conforme a regra da data
    if (this.form.date !== this.lastDate) {
      this.lastDate = this.form.date;
      if (this.form.date === this.todayStr) {
        const available = this.availableStartHours;
        this.form.start_hour = available.length > 0 ? available[0] : this.hours[0];
      } else {
        this.form.start_hour = this.hours[0]; // data futura: começa em 07:00
      }
      this.form.end_hour = '';
    }
    // Se for hoje e o início selecionado já passou, corrige
    const available = this.availableStartHours;
    if (this.form.date === this.todayStr && available.length > 0 && !available.includes(this.form.start_hour)) {
      this.form.start_hour = available[0];
      this.form.end_hour = '';
    }
    // Quando o início muda, reseta o fim se não for mais válido
    if (this.form.end_hour && parseInt(this.form.end_hour) <= parseInt(this.form.start_hour)) {
      this.form.end_hour = '';
    }
    this.calcTotal();
    if (this.form.court_id && this.form.end_hour) {
      this.slotConflict = this.data.isSlotOccupied(this.arena.id, this.form.court_id, this.form.date, this.form.start_hour, this.form.end_hour);
    } else {
      this.slotConflict = false;
    }
  }

  calcTotal() {
    if (!this.form.end_hour) { this.durationHours = 0; this.form.total_amount = 0; return; }
    const s = parseInt(this.form.start_hour), e = parseInt(this.form.end_hour);
    this.durationHours = e > s ? e - s : 0;
    this.form.total_amount = this.durationHours * (this.selectedCourt?.hourly_rate || 0);
  }

  async confirm(): Promise<void> {
    if (!this.form.client_name.trim() || this.confirming) return;
    this.confirming = true;
    try {
      const booking = await this.bookingService.createBooking({
        arena_id:       this.arena.id,
        court_id:       this.form.court_id,
        client_name:     this.form.client_name,
        client_phone:    this.form.client_phone || undefined,
        client_document: this.form.client_document.replace(/\D/g, ''),
        date:           this.form.date,
        start_hour:     this.form.start_hour,
        end_hour:       this.form.end_hour,
        payment_option: this.form.payment_option,
        split_payment:  this.form.split_payment,
        num_players:    this.form.split_payment ? this.form.num_players : undefined,
      });
      this.confirmedBooking = booking;
      if (this.form.split_payment) {
        this.splitPaidCount       = 1;
        this.splitCollectedAmount = booking.total_amount / (booking.num_players || 1);
      } else {
        this.splitPaidCount       = 0;
        this.splitCollectedAmount = 0;
      }
      this.step = 4;
      const msg = this.form.split_payment
        ? 'Cobrança criada! Compartilhe o link com os jogadores.'
        : this.form.payment_option === '100'
          ? 'Reserva garantida! Conclua o pagamento via PIX.'
          : 'Reserva criada! Pague a entrada via PIX para confirmar.';
      this.toast.show(msg);
      // Inicia polling para detectar pagamento confirmado
      this.startPaymentPolling(booking.id);
    } catch (err: any) {
      const msg = err?.error?.error || 'Erro ao criar reserva. Tente novamente.';
      this.toast.show(msg);
    } finally {
      this.confirming = false;
    }
  }

  startPaymentPolling(bookingId: string): void {
    this.stopPaymentPolling();
    this.pollInterval = setInterval(async () => {
      try {
        const b = await this.bookingService.getBookingSilent(bookingId);
        if (b.payment_status === 'pago') {
          this.paymentConfirmed = true;
          this.confirmedBooking = b;
          this.stopPaymentPolling();
          this.toast.show('Pagamento confirmado! Reserva garantida ✅');
        }
      } catch { /* ignora */ }
    }, 5000);
  }

  stopPaymentPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  resetToArena() {
    this.form = this.emptyForm();
    this.selectedCourt = null;
    this.slotConflict = false;
    this.durationHours = 0;
    this.splitPaidCount = 0;
    this.splitCollectedAmount = 0;
    this.step = 1;
  }

  sharePaymentLink(): void {
    const link = `https://arenaflow.app/cobranca/${this.confirmedBooking?.id}`;
    if (navigator.share) {
      navigator.share({ title: 'ArenaFlow — Cobrança', text: 'Pague sua parte da quadra:', url: link });
    } else {
      navigator.clipboard.writeText(link);
      this.toast.show('Link copiado! Cole no WhatsApp dos jogadores.');
    }
  }

  simulateSplitPayment(): void {
    const total    = this.confirmedBooking?.total_amount || 0;
    const players  = this.confirmedBooking?.num_players  || 1;
    const perPlayer = total / players;
    if (this.splitPaidCount < players) {
      this.splitPaidCount++;
      this.splitCollectedAmount = Math.min(total, this.splitCollectedAmount + perPlayer);
      if (this.splitPaidCount === players) {
        this.toast.show('Reserva confirmada! É possível cancelar até 1h antes do horário selecionado sem taxas.');
      }
    }
  }

  getSportGradient(sport: string): string {
    if (sport.includes('tennis'))   return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (sport.includes('futev'))    return 'linear-gradient(135deg, #0ea5e9, #0284c7)';
    if (sport.includes('vôlei'))    return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    if (sport.includes('futebol'))  return 'linear-gradient(135deg, #16a34a, #15803d)';
    return `linear-gradient(135deg, ${this.arena.logo_color}, ${this.arena.logo_color}bb)`;
  }

  getSportIcon(sport: string): string {
    if (sport.includes('tennis'))  return 'sports_tennis';
    if (sport.includes('futebol')) return 'sports_soccer';
    return 'sports_volleyball';
  }

  mapsUrl(): string {
    if (!this.arena) return '#';
    const parts = [this.arena.address, this.arena.neighborhood, this.arena.city].filter(Boolean);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
  }

  copyPix(): void {
    const code = this.confirmedBooking?.pix_qr_code;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.toast.show('Código PIX copiado!');
    });
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

  onCpfInput(event: Event) {
    const el = event.target as HTMLInputElement;
    const d = el.value.replace(/\D/g, '').slice(0, 11);
    let m = '';
    if (d.length === 0)       m = '';
    else if (d.length <= 3)   m = d;
    else if (d.length <= 6)   m = `${d.slice(0,3)}.${d.slice(3)}`;
    else if (d.length <= 9)   m = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    else                      m = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    el.value = m;
    this.form.client_document = m;
  }
}
