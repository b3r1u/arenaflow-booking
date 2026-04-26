import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { Arena, Booking, Court } from '../../models/models';
import { BookingService, BookingResult, PaymentGroup } from '../../services/booking.service';
import { ArenaService } from '../../services/arena.service';
import { ReviewService, Review } from '../../services/review.service';

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
    /* ── Carrossel de avaliações ── */
    .review-track {
      position: relative;
      min-height: 136px;
    }
    .review-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transform: translateX(28px);
      transition: opacity 0.45s ease, transform 0.45s ease;
      pointer-events: none;
    }
    .review-slide.active {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
    .review-slide-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1rem 1.1rem;
    }
    .review-slide-comment {
      font-size: 0.8rem;
      color: var(--foreground);
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .review-avatar {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: hsl(152,69%,40%,0.15);
      color: var(--primary);
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .review-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--border);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: background 0.25s, transform 0.25s, width 0.25s;
    }
    .review-dot.active {
      background: hsl(38,92%,50%);
      transform: scale(1.25);
      width: 18px;
      border-radius: 4px;
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

    /* ── Slot grid ── */
    .slot-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.45rem;
    }
    .slot-btn {
      padding: 0.55rem 0.2rem;
      border-radius: 0.65rem;
      border: 1.5px solid var(--border);
      background: var(--card);
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.14s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      color: var(--foreground);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.2;
      min-height: 2.6rem;
      justify-content: center;
    }
    .slot-btn.available:hover {
      border-color: var(--primary);
      background: hsl(152,69%,40%,0.07);
      color: var(--primary);
    }
    .slot-btn.available-end {
      border-color: hsl(152,69%,40%,0.4);
      color: var(--primary);
      background: hsl(152,69%,40%,0.04);
    }
    .slot-btn.available-end:hover {
      background: hsl(152,69%,40%,0.14);
      border-color: var(--primary);
    }
    .slot-btn.start {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 3px 10px hsl(152,69%,40%,0.4);
    }
    .slot-btn.end {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 3px 10px hsl(152,69%,40%,0.4);
    }
    .slot-btn.in-range {
      background: hsl(152,69%,40%,0.13);
      border-color: hsl(152,69%,40%,0.35);
      color: var(--primary);
    }
    .slot-btn.occupied {
      background: hsl(0,84%,60%,0.07);
      border-color: hsl(0,84%,60%,0.22);
      color: hsl(0,72%,52%);
      cursor: not-allowed;
    }
    .slot-btn.past {
      opacity: 0.32;
      cursor: not-allowed;
      background: var(--muted);
      border-color: transparent;
    }
    .slot-btn.blocked {
      opacity: 0.35;
      cursor: not-allowed;
      background: var(--muted);
      border-color: transparent;
    }
    .slot-label-hint {
      font-size: 0.52rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      opacity: 0.82;
      line-height: 1;
    }
    .slot-step-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.28rem 0.65rem;
      border-radius: 2rem;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .slot-step-hint.picking-start {
      background: hsl(152,69%,40%,0.1);
      color: var(--primary);
    }
    .slot-step-hint.picking-end {
      background: hsl(38,92%,50%,0.12);
      color: hsl(38,92%,35%);
    }
    .slot-step-hint.range-done {
      background: hsl(152,69%,40%,0.12);
      color: var(--primary);
    }

    .slot-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.85rem;
      margin-top: 0.75rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      color: var(--muted-foreground);
    }
    .legend-swatch {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
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

          <!-- ═══ AVALIAÇÕES (carrossel — abaixo das quadras) ═══ -->
          <div *ngIf="arenaReviews.length > 0" class="mt-6 pb-2">

            <div class="flex items-center justify-between mb-3">
              <h3 class="font-heading font-semibold text-sm" style="color:var(--foreground)">
                O que dizem os clientes
              </h3>
              <div class="flex items-center gap-1 px-2.5 py-1 rounded-full"
                   style="background:hsl(38,92%,50%,0.1)">
                <span class="material-icons" style="font-size:0.8rem;color:hsl(38,92%,50%)">star</span>
                <span class="text-xs font-bold" style="color:hsl(38,92%,35%)">{{ arenaAvgRating }}</span>
                <span class="text-xs" style="color:hsl(38,92%,45%)"> · {{ arenaReviews.length }} {{ arenaReviews.length === 1 ? 'avaliação' : 'avaliações' }}</span>
              </div>
            </div>

            <!-- Track -->
            <div class="review-track">
              <div *ngFor="let r of arenaReviews; let i = index"
                   class="review-slide"
                   [class.active]="reviewIdx === i">
                <div class="review-slide-card">

                  <!-- Estrelas + label -->
                  <div class="flex items-center gap-1.5 mb-2">
                    <div class="flex gap-0.5">
                      <span *ngFor="let s of [1,2,3,4,5]" class="material-icons"
                            style="font-size:0.95rem"
                            [style.color]="s <= r.stars ? 'hsl(38,92%,50%)' : 'var(--border)'">star</span>
                    </div>
                    <span class="text-xs font-semibold" style="color:var(--muted-foreground)">
                      {{ ['','Ruim','Regular','Bom','Ótimo','Excelente'][r.stars] }}
                    </span>
                  </div>

                  <!-- Comentário -->
                  <p class="review-slide-comment" [style.font-style]="r.comment ? 'normal' : 'italic'"
                     [style.color]="r.comment ? 'var(--foreground)' : 'var(--muted-foreground)'">
                    {{ r.comment || 'Sem comentário.' }}
                  </p>

                  <!-- Footer -->
                  <div class="flex items-center gap-2 mt-3">
                    <div class="review-avatar">{{ (r.user_name || '?')[0].toUpperCase() }}</div>
                    <span class="text-xs font-semibold truncate" style="color:var(--foreground);max-width:130px">{{ r.user_name }}</span>
                    <span class="text-xs ml-auto flex-shrink-0" style="color:var(--muted-foreground)">{{ r.created_at | date:'dd/MM/yy' }}</span>
                  </div>

                </div>
              </div>
            </div>

            <!-- Dots (só quando > 1) -->
            <div *ngIf="arenaReviews.length > 1" class="flex justify-center items-center gap-1.5 mt-3">
              <button *ngFor="let r of arenaReviews; let i = index"
                      type="button"
                      class="review-dot"
                      [class.active]="reviewIdx === i"
                      (click)="setReviewSlide(i)">
              </button>
            </div>

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

            <!-- Data -->
            <div>
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Data</label>
              <input class="input" type="date" [(ngModel)]="form.date" [min]="todayStr" (ngModelChange)="onDateChange()">
            </div>

            <!-- Grade de horários -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <label class="block text-sm font-semibold" style="color:var(--foreground)">Horário</label>
                <span class="slot-step-hint"
                      [ngClass]="(form.start_hour && form.end_hour) ? 'range-done' : (slotStep === 'start' ? 'picking-start' : 'picking-end')">
                  <span class="material-icons" style="font-size:0.75rem">
                    {{ (form.start_hour && form.end_hour) ? 'check_circle' : (slotStep === 'start' ? 'play_arrow' : 'stop') }}
                  </span>
                  {{ (form.start_hour && form.end_hour) ? 'Alterar seleção' : (slotStep === 'start' ? 'Selecione o início' : 'Selecione o fim') }}
                </span>
              </div>

              <div class="slot-grid">
                <button *ngFor="let h of hours"
                        class="slot-btn"
                        [ngClass]="getSlotStatus(h)"
                        [disabled]="isSlotDisabled(h)"
                        (click)="onSlotClick(h)">
                  <span>{{ h }}</span>
                  <span *ngIf="getSlotStatus(h) === 'occupied'" class="material-icons slot-label-hint" style="font-size:0.7rem">lock</span>
                  <span *ngIf="getSlotStatus(h) === 'start'"    class="slot-label-hint">início</span>
                  <span *ngIf="getSlotStatus(h) === 'end'"      class="slot-label-hint">fim</span>
                </button>
              </div>

              <!-- Legenda -->
              <div class="slot-legend">
                <div class="legend-item">
                  <div class="legend-swatch" style="background:var(--primary)"></div>
                  Selecionado
                </div>
                <div class="legend-item">
                  <div class="legend-swatch" style="background:hsl(152,69%,40%,0.13);border:1px solid hsl(152,69%,40%,0.35)"></div>
                  Intervalo
                </div>
                <div class="legend-item">
                  <div class="legend-swatch" style="background:hsl(0,84%,60%,0.07);border:1px solid hsl(0,84%,60%,0.22)"></div>
                  Ocupado
                </div>
                <div class="legend-item">
                  <div class="legend-swatch" style="background:var(--muted)"></div>
                  Indisponível
                </div>
              </div>
            </div>

            <div *ngIf="durationHours > 0"
                 class="flex items-center justify-between p-4 rounded-xl"
                 style="background:hsl(152,69%,40%,0.06);border:1px solid hsl(152,69%,40%,0.18)">
              <span class="text-sm" style="color:var(--muted-foreground)">
                {{ form.start_hour }} → {{ form.end_hour }} · {{ durationHours }}h × R\${{ selectedCourt?.hourly_rate }}/h
              </span>
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

            <!-- Telefone (oculto se já salvo no perfil) -->
            <div *ngIf="!hasSavedPhone">
              <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">Telefone (WhatsApp)</label>
              <div style="position:relative">
                <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">phone</span>
                <input class="input" style="padding-left:2.25rem" [(ngModel)]="form.client_phone"
                       placeholder="(00) 00000-0000" maxlength="15" (input)="onPhoneInput($event)">
              </div>
              <p *ngIf="!phoneValid && form.client_phone.length > 0" class="text-xs mt-1" style="color:var(--destructive)">Número inválido</p>
              <p *ngIf="!phoneValid && form.client_phone.length === 0" class="text-xs mt-1" style="color:var(--muted-foreground)">* Obrigatório para selecionar forma de pagamento</p>
            </div>

            <!-- CPF (oculto se já salvo no perfil) -->
            <div *ngIf="!hasSavedCpf">
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
                <div class="flex items-center justify-between mb-3">
                  <div class="text-xs font-semibold" style="color:var(--muted-foreground)">JOGADORES ({{ form.players.length }})</div>
                  <div class="flex gap-1">
                    <button (click)="removePlayer(form.players.length - 1)"
                            [disabled]="form.players.length <= 2"
                            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                            style="background:var(--card);border:1.5px solid var(--border);color:var(--foreground)"
                            [style.opacity]="form.players.length <= 2 ? '0.35' : '1'">−</button>
                    <button (click)="addPlayer()"
                            [disabled]="form.players.length >= 20"
                            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                            style="background:var(--primary);color:white;border:none">+</button>
                  </div>
                </div>
                <div class="space-y-3 mb-3">
                  <div *ngFor="let p of form.players; let i = index"
                       class="rounded-xl p-2.5"
                       style="background:var(--card);border:1px solid var(--border)">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                           style="background:var(--primary);color:white">{{ i + 1 }}</div>
                      <input class="input flex-1" style="height:2.25rem;font-size:0.85rem"
                             [(ngModel)]="form.players[i].name"
                             [placeholder]="i === 0 ? form.client_name || 'Seu nome' : 'Nome do jogador ' + (i + 1)">
                    </div>
                    <input class="input w-full" style="height:2.25rem;font-size:0.85rem"
                           [ngModel]="form.players[i].document"
                           (ngModelChange)="onPlayerCpfChange(i, $event)"
                           inputmode="numeric"
                           maxlength="14"
                           placeholder="CPF (000.000.000-00)">
                  </div>
                </div>
                <div class="rounded-xl p-2.5 text-center" style="background:hsl(152,69%,40%,0.1)">
                  <span class="font-heading font-bold" style="color:var(--primary)">R\${{ perPlayerAmountCents / 100 | number:'1.2-2' }}</span>
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

            <!-- Avaliar arena -->
            <button class="btn-primary w-full py-3 mb-3" (click)="goToReview()">
              <span class="material-icons" style="font-size:1rem">star</span>
              Avaliar esta arena
            </button>
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
          <ng-container *ngIf="confirmedBooking?.split_payment && paymentGroup">

            <!-- Cabeçalho -->
            <div class="text-center mb-5">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                   style="background:hsl(152,69%,40%,0.12)">
                <span class="material-icons" style="font-size:2rem;color:var(--primary)">group</span>
              </div>
              <h2 class="font-heading font-bold text-xl mb-1" style="color:var(--foreground)">Cotas geradas!</h2>
              <p class="text-sm" style="color:var(--muted-foreground)">
                Cada jogador tem seu próprio QR Code PIX
              </p>
            </div>

            <!-- Progresso geral -->
            <div class="card p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-heading font-semibold text-sm" style="color:var(--foreground)">Progresso</span>
                <span class="text-xs font-semibold" style="color:var(--primary)">
                  {{ splitPaidCount }} de {{ paymentGroup.splits.length }} pagaram
                </span>
              </div>
              <div class="rounded-full overflow-hidden mb-2" style="height:8px;background:var(--muted)">
                <div class="h-full rounded-full transition-all duration-500"
                     style="background:var(--primary)"
                     [style.width.%]="splitProgressPercent"></div>
              </div>
              <div class="flex justify-between text-xs">
                <span style="color:var(--muted-foreground)">R\${{ splitPaidAmountCents / 100 | number:'1.2-2' }} pagos</span>
                <span style="color:var(--muted-foreground)">R\${{ splitTotalCents / 100 | number:'1.2-2' }} total</span>
              </div>
            </div>

            <!-- Lista de cotas por jogador -->
            <div class="space-y-3 mb-4">
              <div *ngFor="let split of paymentGroup.splits; let i = index"
                   class="card p-4"
                   [style.border-color]="split.status === 'PAGO' ? 'var(--primary)' : 'var(--border)'"
                   [style.border-width]="split.status === 'PAGO' ? '2px' : '1.5px'">

                <!-- Cabeçalho da cota -->
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                       [style.background]="split.status === 'PAGO' ? 'var(--primary)' : isSplitExpired(split) ? 'hsl(0,72%,51%,0.15)' : 'var(--muted)'"
                       [style.color]="split.status === 'PAGO' ? 'white' : isSplitExpired(split) ? '#dc2626' : 'var(--muted-foreground)'">
                    <span class="material-icons" style="font-size:1rem">{{ split.status === 'PAGO' ? 'check' : isSplitExpired(split) ? 'timer_off' : 'person' }}</span>
                  </div>
                  <span class="font-semibold text-sm flex-1" style="color:var(--foreground)">{{ split.player_name }}</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                        [style.background]="split.status === 'PAGO' ? 'hsl(152,69%,40%,0.12)' : isSplitExpired(split) ? 'hsl(0,72%,51%,0.1)' : 'var(--muted)'"
                        [style.color]="split.status === 'PAGO' ? 'var(--primary)' : isSplitExpired(split) ? '#dc2626' : 'var(--muted-foreground)'">
                    {{ split.status === 'PAGO' ? 'Pago ✓' : isSplitExpired(split) ? 'Expirado' : 'Pendente' }}
                  </span>
                </div>

                <!-- Expirado: botão de regenerar -->
                <div *ngIf="isSplitExpired(split)" class="text-center py-3">
                  <span class="material-icons mb-2 block" style="font-size:2rem;color:#dc2626">timer_off</span>
                  <div class="text-sm font-semibold mb-1" style="color:#dc2626">QR Code expirado</div>
                  <div class="text-xs mb-3" style="color:var(--muted-foreground)">R\${{ split.amount / 100 | number:'1.2-2' }}</div>
                  <button class="btn-primary text-sm px-4 py-2"
                          [disabled]="split['regenerating']"
                          (click)="regenerateSplitQr(split)">
                    <span class="material-icons" style="font-size:0.9rem">refresh</span>
                    {{ split['regenerating'] ? 'Gerando...' : 'Gerar novo QR Code' }}
                  </button>
                </div>

                <!-- QR Code (apenas se pendente e não expirado) -->
                <ng-container *ngIf="split.status !== 'PAGO' && !isSplitExpired(split)">
                  <div class="w-36 h-36 rounded-xl mx-auto mb-3 overflow-hidden flex items-center justify-center"
                       style="background:var(--muted)">
                    <img *ngIf="split.pix_qr_code"
                         [src]="split.pix_qr_code"
                         alt="QR Code PIX" style="width:100%;height:100%;object-fit:cover" />
                    <span *ngIf="!split.pix_qr_code" class="material-icons" style="font-size:3rem;color:var(--muted-foreground)">qr_code_2</span>
                  </div>

                  <!-- Valor -->
                  <div class="text-center mb-3">
                    <span class="font-heading font-bold text-lg" style="color:var(--primary)">R\${{ split.amount / 100 | number:'1.2-2' }}</span>
                  </div>

                  <!-- Copia e Cola -->
                  <div *ngIf="split.pix_copy_paste" class="rounded-xl p-2.5 mb-2" style="background:var(--muted)">
                    <div class="text-xs mb-1" style="color:var(--muted-foreground)">PIX Copia e Cola</div>
                    <div class="text-xs break-all" style="color:var(--foreground);word-break:break-all">
                      {{ split.pix_copy_paste | slice:0:60 }}...
                    </div>
                    <button class="mt-2 text-xs font-semibold flex items-center gap-1"
                            style="color:var(--primary);background:none;border:none;cursor:pointer;padding:0"
                            (click)="copyPix(split.pix_copy_paste)">
                      <span class="material-icons" style="font-size:0.9rem">content_copy</span>
                      Copiar código
                    </button>
                  </div>
                </ng-container>

                <!-- Pago: ícone de confirmação -->
                <div *ngIf="split.status === 'PAGO'" class="text-center py-2">
                  <span class="material-icons" style="font-size:2rem;color:var(--primary)">verified</span>
                  <div class="text-sm font-semibold mt-1" style="color:var(--primary)">Pagamento confirmado</div>
                  <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">R\${{ split.amount / 100 | number:'1.2-2' }}</div>
                </div>
              </div>
            </div>

            <!-- Compartilhar link -->
            <button class="btn-primary w-full py-3 mb-2" (click)="sharePaymentLink()">
              <span class="material-icons" style="font-size:1rem">share</span>
              Compartilhar link da reserva
            </button>
            <p class="text-xs text-center mb-4" style="color:var(--muted-foreground)">
              Envie para os jogadores acessarem e pagarem a própria cota
            </p>

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

        <!-- ══ STEP 5: Avaliação ══ -->
        <div *ngIf="step === 5" class="pt-6">

          <ng-container *ngIf="!reviewDone">
            <div class="text-center mb-6">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style="background:hsl(38,92%,50%,0.12)">
                <span class="material-icons" style="font-size:2rem;color:hsl(38,92%,50%)">star_rate</span>
              </div>
              <h2 class="font-heading font-bold text-2xl mb-1" style="color:var(--foreground)">Avalie sua experiência</h2>
              <p class="text-sm" style="color:var(--muted-foreground)">Sua opinião ajuda outros jogadores a escolherem</p>
            </div>

            <div class="card p-5 mb-4">
              <!-- Nome da arena -->
              <div class="flex items-center gap-3 mb-5 pb-4" style="border-bottom:1px solid var(--border)">
                <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-heading font-bold text-sm flex-shrink-0"
                     [style.background]="arena.logo_color">
                  <img *ngIf="arena.logo_url" [src]="arena.logo_url" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />
                  <span *ngIf="!arena.logo_url" style="color:white">{{ arena.logo_initials }}</span>
                </div>
                <div>
                  <div class="font-heading font-semibold text-sm" style="color:var(--foreground)">{{ arena.name }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ arena.neighborhood }} · {{ arena.city }}</div>
                </div>
              </div>

              <!-- Estrelas -->
              <div class="mb-5">
                <label class="block text-sm font-semibold mb-3 text-center" style="color:var(--foreground)">
                  {{ reviewStars === 0 ? 'Toque para avaliar' : reviewStarLabel }}
                </label>
                <div class="flex justify-center gap-2">
                  <button *ngFor="let s of [1,2,3,4,5]"
                          type="button"
                          (click)="selectStar(s)"
                          (mouseenter)="reviewHover = s"
                          (mouseleave)="reviewHover = 0"
                          class="transition-transform active:scale-125"
                          style="background:none;border:none;cursor:pointer;padding:0.25rem">
                    <span class="material-icons"
                          style="font-size:2.5rem;transition:color 0.12s,transform 0.12s"
                          [style.color]="s <= (reviewHover || reviewStars) ? 'hsl(38,92%,50%)' : 'var(--border)'"
                          [style.transform]="s <= (reviewHover || reviewStars) ? 'scale(1.15)' : 'scale(1)'">
                      star
                    </span>
                  </button>
                </div>
              </div>

              <!-- Comentário -->
              <div>
                <label class="block text-sm font-semibold mb-2" style="color:var(--foreground)">
                  Comentário <span style="color:var(--muted-foreground);font-weight:400">(opcional)</span>
                </label>
                <textarea class="input"
                          style="min-height:100px;resize:none;padding-top:0.6rem"
                          [(ngModel)]="reviewComment"
                          placeholder="Como foi jogar aqui? Conte sua experiência..."
                          maxlength="500"></textarea>
                <div class="text-right text-xs mt-1" style="color:var(--muted-foreground)">{{ reviewComment.length }}/500</div>
              </div>
            </div>

            <button type="button"
                    class="btn-primary w-full py-3 mb-2"
                    [disabled]="reviewStars === 0 || reviewSubmitting"
                    (click)="submitReview()">
              <span *ngIf="reviewSubmitting" class="material-icons" style="font-size:1rem;animation:spin 1s linear infinite">refresh</span>
              <span *ngIf="!reviewSubmitting" class="material-icons" style="font-size:1rem">send</span>
              {{ reviewSubmitting ? 'Enviando...' : 'Enviar avaliação' }}
            </button>

            <button type="button" class="btn-ghost w-full py-2 text-sm" (click)="skipReview()">
              Pular
            </button>
          </ng-container>

          <!-- Confirmação após envio -->
          <ng-container *ngIf="reviewDone">
            <div class="text-center py-8">
              <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                   style="background:hsl(38,92%,50%,0.12)">
                <span class="material-icons" style="font-size:3rem;color:hsl(38,92%,50%)">sentiment_very_satisfied</span>
              </div>
              <h2 class="font-heading font-bold text-2xl mb-2" style="color:var(--foreground)">Obrigado!</h2>
              <p class="text-sm mb-6" style="color:var(--muted-foreground)">Sua avaliação foi enviada com sucesso.</p>

              <!-- Mini prévia das estrelas -->
              <div class="flex justify-center gap-1 mb-6">
                <span *ngFor="let s of [1,2,3,4,5]"
                      class="material-icons"
                      style="font-size:1.5rem"
                      [style.color]="s <= reviewStars ? 'hsl(38,92%,50%)' : 'var(--border)'">star</span>
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

  /** Two-step slot selection: 'start' → pick start hour, 'end' → pick end hour */
  slotStep: 'start' | 'end' = 'start';

  // Split payment tracking
  splitCollectedAmount = 0;
  paymentGroup: PaymentGroup | null = null;

  // Reviews
  arenaReviews: Review[] = [];

  // Carrossel de avaliações (step 1)
  reviewIdx   = 0;
  private reviewTimer: any = null;

  // Review form (step 5)
  reviewStars      = 0;
  reviewHover      = 0;
  reviewComment    = '';
  reviewSubmitting = false;
  reviewDone       = false;

  get reviewStarLabel(): string {
    const labels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'];
    return labels[this.reviewStars] || '';
  }

  form = this.emptyForm();

  hours = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  get todayStr()        { return new Date().toISOString().split('T')[0]; }
  get availableCourts() { return this.courts.filter(c => c.status !== 'bloqueada'); }
  get perPlayerAmount() { return this.form.num_players > 1 ? this.form.total_amount / this.form.num_players : this.form.total_amount; }

  get splitPerPlayer()    { return (this.confirmedBooking?.total_amount || 0) / (this.confirmedBooking?.num_players || 1); }
  get splitPlayersArray() { return Array.from({ length: this.confirmedBooking?.num_players || 0 }); }

  /** Returns true if the 1-hour block starting at `hour` is in the past (today only) */
  isHourPast(hour: string): boolean {
    if (this.form.date !== this.todayStr) return false;
    return parseInt(hour) <= new Date().getHours();
  }

  /** Returns true if the 1-hour slot [hour, hour+1] is already booked */
  isHourOccupied(hour: string): boolean {
    if (!this.form.court_id) return false;
    const h = parseInt(hour);
    if (h >= 23) return false; // no block beyond 23:00
    const endH = `${(h + 1).toString().padStart(2, '0')}:00`;
    return this.data.isSlotOccupied(this.arena.id, this.form.court_id, this.form.date, hour, endH);
  }

  /** First occupied hour strictly after start (used to block invalid end selections) */
  private get firstOccupiedAfterStart(): string | null {
    const startIdx = this.hours.indexOf(this.form.start_hour);
    if (startIdx < 0) return null;
    for (let i = startIdx + 1; i < this.hours.length; i++) {
      if (this.isHourOccupied(this.hours[i])) return this.hours[i];
    }
    return null;
  }

  /**
   * Visual state for each cell in the slot grid.
   * Possible values: 'past' | 'occupied' | 'available' | 'start' | 'end' | 'in-range' | 'available-end' | 'blocked'
   */
  getSlotStatus(hour: string): string {
    const hInt = parseInt(hour);

    if (this.isHourPast(hour)) return 'past';
    if (this.isHourOccupied(hour)) return 'occupied';

    const startInt = this.form.start_hour ? parseInt(this.form.start_hour) : -1;
    const endInt   = this.form.end_hour   ? parseInt(this.form.end_hour)   : -1;

    if (this.slotStep === 'start') {
      if (hInt >= 23 && !this.form.end_hour) return 'blocked';

      // Seleção completa (início + fim já escolhidos)
      if (this.form.end_hour) {
        if (hour === this.form.start_hour)  return 'start';
        if (hour === this.form.end_hour)    return 'end';
        if (hInt > startInt && hInt < endInt) return 'in-range';
        if (hInt > endInt)                  return 'blocked'; // após fim → bloqueado
        return 'available'; // antes do início → disponível para nova seleção
      }

      if (hour === this.form.start_hour) return 'start';
      return 'available';
    }

    // — Picking end —
    if (hour === this.form.start_hour) return 'start';
    if (hInt <= startInt) return 'blocked';

    const firstOcc = this.firstOccupiedAfterStart;
    if (firstOcc && hInt >= parseInt(firstOcc)) return 'blocked';

    if (hour === this.form.end_hour) return 'end';
    if (endInt > 0 && hInt > startInt && hInt < endInt) return 'in-range';
    return 'available-end';
  }

  /** Whether the button should be disabled (not clickable) */
  isSlotDisabled(hour: string): boolean {
    const s = this.getSlotStatus(hour);
    return s === 'past' || s === 'occupied' || s === 'blocked';
  }

  /** Handle click on a slot cell */
  onSlotClick(hour: string): void {
    if (this.isSlotDisabled(hour)) return;

    if (this.slotStep === 'start') {
      // Clique no fim → desmarca o fim e volta a escolher fim
      if (this.form.end_hour && hour === this.form.end_hour) {
        this.form.end_hour    = '';
        this.slotStep         = 'end';
        this.durationHours    = 0;
        this.form.total_amount = 0;
        return;
      }
      // Clica em qualquer outra hora → começa nova seleção
      this.form.start_hour  = hour;
      this.form.end_hour    = '';
      this.slotStep         = 'end';
      this.slotConflict     = false;
      this.durationHours    = 0;
      this.form.total_amount = 0;
    } else {
      if (hour === this.form.start_hour) {
        // Tap start again → reset selection
        this.form.start_hour  = '';
        this.form.end_hour    = '';
        this.slotStep         = 'start';
        this.durationHours    = 0;
        this.form.total_amount = 0;
        return;
      }
      this.form.end_hour = hour;
      this.slotStep = 'start';
      this.calcTotal();
      this.slotConflict = this.form.court_id
        ? this.data.isSlotOccupied(this.arena.id, this.form.court_id, this.form.date, this.form.start_hour, this.form.end_hour)
        : false;
    }
  }

  /** Reset slot selection when the date changes */
  onDateChange(): void {
    this.form.start_hour   = '';
    this.form.end_hour     = '';
    this.slotStep          = 'start';
    this.slotConflict      = false;
    this.durationHours     = 0;
    this.form.total_amount = 0;
    this.fetchAvailability();
  }

  /** Limpa a seleção de horário (botão × no pill) */
  resetSlotSelection(): void {
    this.form.start_hour   = '';
    this.form.end_hour     = '';
    this.slotStep          = 'start';
    this.slotConflict      = false;
    this.durationHours     = 0;
    this.form.total_amount = 0;
  }

  constructor(private data: DataService, private toast: ToastService, public auth: AuthService, private userProfile: UserProfileService, private bookingService: BookingService, private arenaService: ArenaService, private reviewService: ReviewService) {}

  get arenaAvgRating(): number {
    if (!this.arenaReviews.length) return 0;
    const avg = this.arenaReviews.reduce((s: number, r: any) => s + r.stars, 0) / this.arenaReviews.length;
    return Math.round(avg * 10) / 10;
  }

  ngOnDestroy(): void {
    this.stopPaymentPolling();
    this.stopReviewCarousel();
  }

  startReviewCarousel(): void {
    this.stopReviewCarousel();
    if (this.arenaReviews.length > 3) {
      this.reviewTimer = setInterval(() => {
        this.reviewIdx = (this.reviewIdx + 1) % this.arenaReviews.length;
      }, 4000);
    }
  }

  stopReviewCarousel(): void {
    if (this.reviewTimer) { clearInterval(this.reviewTimer); this.reviewTimer = null; }
  }

  setReviewSlide(i: number): void {
    this.reviewIdx = i;
    // Reinicia o timer ao navegar manualmente
    if (this.arenaReviews.length > 3) {
      this.stopReviewCarousel();
      this.reviewTimer = setInterval(() => {
        this.reviewIdx = (this.reviewIdx + 1) % this.arenaReviews.length;
      }, 4000);
    }
  }

  ngOnInit() {
    this.courts = this.arena.courts ?? [];

    // Carrega avaliações do banco
    this.reviewService.getReviews(this.arena.id)
      .then(reviews => {
        this.arenaReviews = reviews;
        this.startReviewCarousel();
      })
      .catch(() => { /* mantém vazio em caso de erro */ });

    // Busca dados frescos da arena para garantir preços atualizados
    this.arenaService.getArenaById(this.arena.id).subscribe({
      next: ({ arena }) => {
        this.arena = arena;
        this.courts = arena.courts ?? [];
      },
      error: () => { /* mantém dados do cache em caso de erro */ },
    });
  }

  emptyForm() {
    return {
      court_id: '', date: new Date().toISOString().split('T')[0],
      start_hour: '', end_hour: '',
      client_name: '', client_phone: '', client_document: '',
      num_players: 2, split_payment: false, total_amount: 0,
      payment_option: '50' as '50' | '100',
      players: [{ name: '', document: '' }, { name: '', document: '' }] as { name: string; document: string }[],
    };
  }

  addPlayer(): void {
    if (this.form.players.length < 20) {
      this.form.players = [...this.form.players, { name: '', document: '' }];
    }
  }

  removePlayer(i: number): void {
    if (this.form.players.length > 2) {
      this.form.players = this.form.players.filter((_, idx) => idx !== i);
    }
  }

  /** Aplica máscara 000.000.000-00 enquanto o usuário digita */
  onPlayerCpfChange(i: number, value: string): void {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    let masked   = digits;
    if (digits.length > 9)      masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    else if (digits.length > 6) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    else if (digits.length > 3) masked = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    this.form.players[i].document = masked;
  }

  get perPlayerAmountCents(): number {
    const n = this.form.players.length;
    return n > 0 ? Math.floor((this.form.total_amount * 100) / n) : 0;
  }

  get splitPaidAmountCents(): number {
    return (this.paymentGroup?.paid_amount ?? 0);
  }

  get splitTotalCents(): number {
    return (this.paymentGroup?.total_amount ?? 0);
  }

  get splitProgressPercent(): number {
    const total = this.splitTotalCents;
    return total > 0 ? Math.min(100, (this.splitPaidAmountCents / total) * 100) : 0;
  }

  get splitPaidCount(): number {
    return this.paymentGroup?.splits.filter(s => s.status === 'PAGO').length ?? 0;
  }

  goToStep3() {
    const profile = this.userProfile.getProfile();
    const user    = this.auth.user();
    if (!this.form.client_name.trim())
      this.form.client_name = profile.name || user?.displayName || '';
    if (!this.form.client_phone.trim() && profile.phone)
      this.form.client_phone = this.formatPhone(profile.phone);
    if (!this.form.client_document.trim() && profile.cpf)
      this.form.client_document = this.formatCpf(profile.cpf);
    this.step = 3;
  }

  private formatPhone(digits: string): string {
    const d = digits.replace(/\D/g, '');
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return digits;
  }

  private formatCpf(digits: string): string {
    const d = digits.replace(/\D/g, '');
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return digits;
  }

  get hasSavedPhone(): boolean { return !!this.userProfile.getProfile().phone; }
  get hasSavedCpf():   boolean { return !!this.userProfile.getProfile().cpf;   }

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
    this.form.court_id    = court.id;
    this.selectedCourt    = court;
    this.form.start_hour  = '';
    this.form.end_hour    = '';
    this.slotStep         = 'start';
    this.slotConflict     = false;
    this.durationHours    = 0;
    this.form.total_amount = 0;
    this.step = 2;
    this.fetchAvailability();
  }

  private async fetchAvailability(): Promise<void> {
    if (!this.form.court_id || !this.form.date) return;
    try {
      const slots = await this.bookingService.getAvailability(
        this.arena.id, this.form.court_id, this.form.date
      );
      this.data.loadOccupiedSlots(this.arena.id, this.form.court_id, this.form.date, slots);
    } catch { /* ignora silenciosamente */ }
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
    this.paymentGroup = null;
    try {
      // 1. Cria a reserva
      const booking = await this.bookingService.createBooking({
        arena_id:        this.arena.id,
        court_id:        this.form.court_id,
        client_name:     this.form.client_name,
        client_phone:    this.form.client_phone || undefined,
        client_document: this.form.client_document.replace(/\D/g, ''),
        date:            this.form.date,
        start_hour:      this.form.start_hour,
        end_hour:        this.form.end_hour,
        payment_option:  this.form.payment_option,
        split_payment:   this.form.split_payment,
        num_players:     this.form.split_payment ? this.form.players.length : undefined,
      });

      this.confirmedBooking = booking;
      this.paymentConfirmed = false;

      // 2. Se split, cria o grupo de pagamento com os nomes dos jogadores
      if (this.form.split_payment && this.form.payment_option === '100') {
        // Garante que o 1º jogador tem o nome do criador
        const players = this.form.players.map((p, i) => ({
          name:     p.name.trim() || (i === 0 ? this.form.client_name : `Jogador ${i + 1}`),
          document: (p.document || '').replace(/\D/g, '') || undefined,
        }));
        const group = await this.bookingService.createPaymentGroup(booking.id, {
          payment_type: 'SPLIT',
          players,
        });
        this.paymentGroup = group;
      } else if (this.form.payment_option === '50') {
        // DEPOSIT — 50% do criador da reserva
        const group = await this.bookingService.createPaymentGroup(booking.id, {
          payment_type: 'DEPOSIT',
          player_name:  this.form.client_name,
          player_email: this.auth.user()?.email || undefined,
        });
        this.paymentGroup = group;
      } else {
        // 100% individual — fluxo legado (QR code único)
        this.splitCollectedAmount = 0;
      }

      this.step = 4;
      const msg = this.form.split_payment
        ? 'QR Codes gerados! Compartilhe o link com os jogadores.'
        : this.form.payment_option === '100'
          ? 'Reserva garantida! Conclua o pagamento via PIX.'
          : 'Reserva criada! Pague a entrada via PIX para confirmar.';
      this.toast.show(msg);
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
        // Sincroniza Booking
        const b = await this.bookingService.getBookingSilent(bookingId);
        this.confirmedBooking = b;

        // Se for split/deposit, sincroniza também o grupo de pagamento e dispara toasts por cota paga
        if (this.paymentGroup) {
          try {
            const fresh = await this.bookingService.getPaymentGroupSilent(bookingId);
            this.notifyNewlyPaidSplits(this.paymentGroup, fresh);
            this.paymentGroup = fresh;
          } catch { /* mantém o grupo atual em caso de erro */ }
        }

        // Encerramento: paga totalmente OU sinal pago (DEPOSIT)
        const fullyPaid =
          b.payment_status === 'pago' ||
          this.paymentGroup?.status === 'PAGO' ||
          (this.paymentGroup?.payment_type === 'DEPOSIT' && b.payment_status === 'sinal_pago');

        if (fullyPaid) {
          this.paymentConfirmed = true;
          this.stopPaymentPolling();
          this.toast.show('Pagamento confirmado! Reserva garantida ✅');
        }
      } catch { /* ignora */ }
    }, 5000);
  }

  /** Retorna true se o PIX da cota já expirou e ainda está pendente. */
  isSplitExpired(split: PaymentSplit): boolean {
    if (split.status === 'PAGO') return false;
    if (!split.pix_expires_at) return false;
    return new Date(split.pix_expires_at) < new Date();
  }

  /** Regenera o QR Code de uma cota expirada. */
  async regenerateSplitQr(split: PaymentSplit): Promise<void> {
    if (!this.confirmedBooking) return;
    (split as any)['regenerating'] = true;
    try {
      const updated = await this.bookingService.regenerateSplit(this.confirmedBooking.id, split.id);
      // Atualiza a cota no paymentGroup em memória
      if (this.paymentGroup) {
        this.paymentGroup = {
          ...this.paymentGroup,
          splits: this.paymentGroup.splits.map(s => s.id === updated.id ? { ...s, ...updated } : s),
        };
      }
      this.toast.show('Novo QR Code gerado!');
    } catch {
      this.toast.show('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      (split as any)['regenerating'] = false;
    }
  }

  /** Compara estados antes/depois e exibe toast para cada cota recém-paga. */
  private notifyNewlyPaidSplits(prev: PaymentGroup, next: PaymentGroup): void {
    for (const ns of next.splits) {
      const ps = prev.splits.find(s => s.id === ns.id);
      if (ps && ps.status !== 'PAGO' && ns.status === 'PAGO') {
        this.toast.show(`✅ ${ns.player_name} pagou a cota`);
      }
    }
  }

  stopPaymentPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  selectStar(n: number): void {
    this.reviewStars = n;
    this.reviewHover = 0;
  }

  goToReview(): void {
    this.reviewStars      = 0;
    this.reviewHover      = 0;
    this.reviewComment    = '';
    this.reviewDone       = false;
    this.reviewSubmitting = false;
    this.step = 5;
  }

  async submitReview(): Promise<void> {
    if (this.reviewStars === 0 || this.reviewSubmitting) return;
    this.reviewSubmitting = true;
    try {
      const user    = this.auth.user();
      const profile = this.userProfile.getProfile();
      const userName =
        profile.name ||
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'Anônimo';

      const review = await this.reviewService.createReview({
        establishment_id: this.arena.id,
        stars:            this.reviewStars,
        comment:          this.reviewComment.trim() || undefined,
        user_name:        userName,
      });

      this.arenaReviews = [review, ...this.arenaReviews];
      this.arena = {
        ...this.arena,
        reviews_count: this.arenaReviews.length,
        rating: Math.round(
          (this.arenaReviews.reduce((s, r) => s + r.stars, 0) / this.arenaReviews.length) * 10
        ) / 10,
      };
      this.reviewDone = true;
    } catch {
      this.toast.show('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      this.reviewSubmitting = false;
    }
  }

  skipReview(): void {
    this.resetToArena();
  }

  resetToArena() {
    this.form = this.emptyForm();
    this.selectedCourt    = null;
    this.slotConflict     = false;
    this.durationHours    = 0;
    this.splitCollectedAmount = 0;
    this.paymentGroup         = null;
    this.slotStep = 'start';
    this.step = 1;
  }

  sharePaymentLink(): void {
    const link = `${window.location.origin}/reserva/${this.confirmedBooking?.id}`;
    if (navigator.share) {
      navigator.share({ title: 'ArenaFlow — Pagamento da quadra', text: 'Acesse e pague sua parte:', url: link });
    } else {
      navigator.clipboard.writeText(link);
      this.toast.show('Link copiado! Compartilhe com os jogadores.');
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

  copyPix(code?: string | null): void {
    const target = code ?? this.confirmedBooking?.pix_qr_code;
    if (!target) return;
    navigator.clipboard.writeText(target).then(() => {
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
