import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { Arena, Booking, Court } from '../../models/models';
import { BookingService, BookingResult, PaymentGroup, PaymentSplit, CancelPreview } from '../../services/booking.service';
import { ArenaService } from '../../services/arena.service';
import { ReviewService, Review } from '../../services/review.service';
import { MensalistaService, MensalistaResult } from '../../services/mensalista.service';

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
    /* ── Mensalista CTA card ── */
    .mensalista-cta {
      border-radius: 1.25rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, hsl(152,69%,40%,0.08) 0%, hsl(152,69%,40%,0.03) 100%);
      border: 1.5px solid hsl(152,69%,40%,0.25);
      position: relative;
      overflow: hidden;
      animation: cta-glow 3.5s ease-in-out infinite;
    }
    .mensalista-cta::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 55%;
      height: 100%;
      background: linear-gradient(90deg, transparent, hsl(152,69%,40%,0.07), transparent);
      animation: cta-shimmer 4.5s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes cta-glow {
      0%, 100% { box-shadow: 0 2px 14px hsl(152,69%,40%,0.07); border-color: hsl(152,69%,40%,0.22); }
      50%       { box-shadow: 0 4px 28px hsl(152,69%,40%,0.18); border-color: hsl(152,69%,40%,0.42); }
    }
    @keyframes cta-shimmer {
      0%        { left: -100%; }
      60%, 100% { left: 150%; }
    }
    .cta-icon {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.875rem;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px hsl(152,69%,40%,0.35);
      animation: cta-float 3.5s ease-in-out infinite;
    }
    @keyframes cta-float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-4px); }
    }
    .cta-bullet {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--foreground);
    }
    .cta-price-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.7rem;
      border-radius: 9999px;
      background: hsl(36,95%,55%,0.12);
      border: 1px solid hsl(36,95%,55%,0.3);
      font-size: 0.73rem;
      font-weight: 600;
      color: hsl(36,68%,36%);
    }
    [data-theme="dark"] .cta-price-pill { color: hsl(36,90%,65%); }

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
    .slot-btn.mensalista {
      background: hsl(36,95%,55%,0.1);
      border-color: hsl(36,95%,55%,0.4);
      color: hsl(36,70%,38%);
      cursor: not-allowed;
    }
    [data-theme="dark"] .slot-btn.mensalista {
      color: hsl(36,90%,65%);
    }
    .mensalista-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
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

    /* ── Cancel section (wrapper com separador visual) ── */
    .cancel-section {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      width: 100%;
    }

    /* ── Cancel button ── */
    .btn-cancel-booking {
      width: 100%;
      padding: 0.7rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid hsl(0,72%,51%,0.4);
      background: transparent;
      color: hsl(0,72%,51%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      transition: background 0.15s;
      box-sizing: border-box;
    }
    .btn-cancel-booking:hover    { background: hsl(0,72%,51%,0.06); }
    .btn-cancel-booking:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Cancel modal ── */
    .cancel-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeInModal 0.15s ease;
    }
    .cancel-modal-sheet {
      background: var(--card);
      border-radius: 1.25rem;
      padding: 1.75rem 1.5rem;
      width: 100%; max-width: 420px;
      animation: scaleInModal 0.18s ease;
    }
    @keyframes fadeInModal  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes scaleInModal { from { transform: scale(0.94); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    .btn-confirm-cancel {
      width: 100%; padding: 0.75rem; border-radius: 0.75rem;
      font-weight: 700; font-size: 0.9rem;
      font-family: var(--font-heading, inherit);
      border: none; background: hsl(0,72%,51%); color: white;
      cursor: pointer; transition: opacity 0.15s;
    }
    .btn-confirm-cancel:hover    { opacity: 0.88; }
    .btn-confirm-cancel:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-back-modal {
      width: 100%; padding: 0.65rem; border-radius: 0.75rem;
      font-weight: 600; font-size: 0.85rem;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid var(--border);
      background: transparent; color: var(--muted-foreground);
      cursor: pointer; transition: background 0.15s;
      margin-top: 0.5rem;
    }
    .btn-back-modal:hover { background: var(--muted); }

    /* ── MC Cards — seletor de quadra no fluxo mensalista ── */
    .mc-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.5rem;
    }
    .mc-card {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.7rem 0.75rem;
      border-radius: 0.875rem;
      border: 1.5px solid var(--border);
      background: var(--card);
      cursor: pointer; text-align: left; width: 100%;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
    }
    .mc-card:hover {
      border-color: var(--primary);
      background: hsl(152,69%,40%,0.04);
      box-shadow: 0 2px 12px hsl(152,69%,40%,0.1);
    }
    .mc-card--selected {
      border-color: var(--primary);
      background: hsl(152,69%,40%,0.07);
      box-shadow: 0 2px 12px hsl(152,69%,40%,0.12);
    }
    .mc-card-icon {
      width: 2rem; height: 2rem;
      border-radius: 0.625rem;
      background: hsl(152,69%,40%,0.1);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .mc-card--selected .mc-card-icon { background: var(--primary); }
    .mc-card-icon .material-icons { font-size: 1rem !important; color: var(--primary); transition: color 0.15s; }
    .mc-card--selected .mc-card-icon .material-icons { color: white; }
    .mc-card-body { flex: 1; min-width: 0; }
    .mc-card-name {
      display: block; font-size: 0.78rem; font-weight: 700;
      color: var(--foreground);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-family: var(--font-heading, inherit);
      line-height: 1.2;
    }
    .mc-card-rate {
      display: block; font-size: 0.67rem; font-weight: 600;
      color: var(--primary); margin-top: 0.15rem;
    }
    .mc-card-check {
      font-size: 1.1rem !important; color: var(--primary);
      flex-shrink: 0; opacity: 0; transform: scale(0.6);
      transition: opacity 0.15s, transform 0.15s;
    }
    .mc-card--selected .mc-card-check { opacity: 1; transform: scale(1); }

    /* ── Alterar início chip ── */
    .alterar-inicio-chip {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.7rem; font-weight: 700;
      color: var(--primary);
      background: hsl(152,69%,40%,0.1);
      border: 1px solid hsl(152,69%,40%,0.28);
      border-radius: 2rem; padding: 0.22rem 0.6rem;
      cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
      font-family: var(--font-heading, inherit);
    }
    .alterar-inicio-chip:hover {
      background: hsl(152,69%,40%,0.18);
      box-shadow: 0 1px 6px hsl(152,69%,40%,0.15);
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

          <!-- ═══ Mensalista CTA ═══ -->
          <div class="mensalista-cta mt-5">

            <!-- Topo: ícone + título -->
            <div class="flex items-start gap-3 mb-3">
              <div class="cta-icon">
                <span class="material-icons text-white" style="font-size:1.35rem">calendar_month</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-heading font-bold text-base leading-tight" style="color:var(--foreground)">
                  Seu jogo garantido toda semana ⚽
                </p>
                <p class="text-xs mt-1" style="color:var(--muted-foreground)">
                  Escolha o dia, o horário e jogue com sua galera sem disputa por vaga.
                </p>
              </div>
            </div>

            <!-- Destaques -->
            <div class="space-y-1.5 mb-3 pl-1">
              <div class="cta-bullet">
                <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">check_circle</span>
                Horário reservado por 1 mês
              </div>
              <div class="cta-bullet">
                <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">check_circle</span>
                Ideal para grupos fixos
              </div>
              <div class="cta-bullet">
                <span class="material-icons" style="font-size:0.9rem;color:var(--primary)">check_circle</span>
                Mais organização, menos dor de cabeça
              </div>
            </div>

            <!-- Preço mensalista -->
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold"
                   style="background:hsl(152,69%,40%,0.1);color:var(--primary)">
                <span class="material-icons" style="font-size:0.8rem">payments</span>
                {{ mensalistaCTARateLabel() }}/h · plano mensal
              </div>
              <div class="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
                   style="background:var(--muted);color:var(--muted-foreground)">
                <span class="material-icons" style="font-size:0.8rem">flash_on</span>
                R\${{ arena.price_from }}{{ arena.price_from !== arena.price_to ? '–' + arena.price_to : '' }}/h avulso
              </div>
            </div>

            <!-- Botão -->
            <button class="btn-primary w-full" (click)="openMensalistaFlow()">
              <span class="material-icons" style="font-size:1rem">repeat</span>
              Quero ser mensalista
            </button>

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

            <!-- Cancelar reserva — só exibe após pagamento confirmado pela API -->
            <div *ngIf="['pago','sinal_pago','parcial'].includes(confirmedBooking?.payment_status ?? '')"
                 class="cancel-section">
              <button class="btn-cancel-booking"
                      [disabled]="cancelInfoLoading || cancelling"
                      (click)="openCancelFlow()">
                <span class="material-icons" style="font-size:0.9rem"
                      [style.animation]="(cancelInfoLoading || cancelling) ? 'spin 1s linear infinite' : 'none'">
                  {{ (cancelInfoLoading || cancelling) ? 'refresh' : 'cancel' }}
                </span>
                {{ cancelling ? 'Cancelando...' : cancelInfoLoading ? 'Verificando...' : (cancelInfo?.requires_fee ? 'Cancelar com taxa' : 'Cancelar reserva') }}
              </button>
            </div>

            <div class="flex gap-2 mt-3">
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

            <!-- Banner de status da reserva -->
            <div class="rounded-2xl p-4 mb-4 flex items-center gap-3 transition-all duration-500"
                 [style.background]="bookingStatusBg"
                 [style.border]="'1.5px solid ' + bookingStatusBorder">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                   [style.background]="bookingStatusIconBg">
                <span class="material-icons" [style.color]="bookingStatusColor" style="font-size:1.3rem">
                  {{ bookingStatusIcon }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm" [style.color]="bookingStatusColor">{{ bookingStatusTitle }}</div>
                <div class="text-xs mt-0.5" style="color:var(--muted-foreground)">{{ bookingStatusDesc }}</div>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                    [style.background]="bookingStatusIconBg"
                    [style.color]="bookingStatusColor">
                {{ bookingStatusLabel }}
              </span>
            </div>

            <!-- Progresso geral -->
            <div class="card p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-heading font-semibold text-sm" style="color:var(--foreground)">Progresso</span>
                <span class="text-xs font-semibold" style="color:var(--primary)">
                  {{ splitPaidCount }} de {{ paymentGroup.splits.length }} pagaram
                </span>
              </div>
              <!-- Barra com marcador de 50% -->
              <div class="relative rounded-full overflow-visible mb-3" style="height:8px;background:var(--muted)">
                <div class="h-full rounded-full transition-all duration-500"
                     [style.background]="splitProgressPercent >= 100 ? 'var(--primary)' : splitProgressPercent >= 50 ? 'hsl(152,69%,40%)' : 'hsl(45,93%,47%)'"
                     [style.width.%]="splitProgressPercent"></div>
                <!-- Marcador de 50% -->
                <div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                     style="left:50%;transform:translate(-50%,-50%)">
                  <div class="w-0.5 h-3 rounded-full"
                       [style.background]="splitProgressPercent >= 50 ? 'var(--primary)' : 'var(--muted-foreground)'"
                       style="margin-top:-2px"></div>
                </div>
              </div>
              <div class="flex justify-between text-xs">
                <span style="color:var(--muted-foreground)">R\${{ splitPaidAmountCents / 100 | number:'1.2-2' }} pagos</span>
                <span class="font-semibold" [style.color]="splitProgressPercent >= 50 ? 'var(--primary)' : 'hsl(45,93%,47%)'">
                  50% = quadra garantida
                </span>
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

            <!-- Cancelar reserva (split) — só exibe após pagamento confirmado pela API -->
            <div *ngIf="['pago','sinal_pago','parcial'].includes(confirmedBooking?.payment_status ?? '')"
                 class="cancel-section" style="margin-bottom:0.75rem">
              <button class="btn-cancel-booking"
                      [disabled]="cancelInfoLoading || cancelling"
                      (click)="openCancelFlow()">
                <span class="material-icons" style="font-size:0.9rem"
                      [style.animation]="(cancelInfoLoading || cancelling) ? 'spin 1s linear infinite' : 'none'">
                  {{ (cancelInfoLoading || cancelling) ? 'refresh' : 'cancel' }}
                </span>
                {{ cancelling ? 'Cancelando...' : cancelInfoLoading ? 'Verificando...' : (cancelInfo?.requires_fee ? 'Cancelar com taxa' : 'Cancelar reserva') }}
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

        <!-- ══ Modal de cancelamento ══ -->
        <div *ngIf="showCancelModal" class="cancel-modal-overlay" (click)="showCancelModal = false">
          <div class="cancel-modal-sheet" (click)="$event.stopPropagation()">

            <!-- Ícone -->
            <div class="flex justify-center mb-4">
              <div class="w-14 h-14 rounded-full flex items-center justify-center"
                   style="background:hsl(0,72%,51%,0.1)">
                <span class="material-icons" style="font-size:1.6rem;color:hsl(0,72%,51%)">cancel</span>
              </div>
            </div>

            <h3 class="font-heading font-bold text-lg text-center mb-1" style="color:var(--foreground)">
              Cancelar reserva?
            </h3>
            <p class="text-sm text-center mb-4" style="color:var(--muted-foreground)">
              Reserva em <strong style="color:var(--foreground)">{{ arena.name }}</strong>
              no dia <strong style="color:var(--foreground)">{{ confirmedBooking?.date | date:'dd/MM/yyyy':'UTC' }}</strong>
              às <strong style="color:var(--foreground)">{{ confirmedBooking?.start_hour }}</strong>.
            </p>

            <!-- Sem taxa -->
            <div *ngIf="!cancelInfo?.requires_fee"
                 class="rounded-xl p-3 mb-5 flex gap-2 items-start"
                 style="background:hsl(152,69%,40%,0.08);border:1px solid hsl(152,69%,40%,0.2)">
              <span class="material-icons flex-shrink-0" style="font-size:1rem;color:var(--primary);margin-top:1px">check_circle</span>
              <p class="text-xs leading-relaxed" style="color:var(--primary)">
                Cancelamento <strong>sem taxa</strong> — dentro do prazo gratuito.
                O valor pago será reembolsado integralmente.
              </p>
            </div>

            <!-- Com taxa -->
            <div *ngIf="cancelInfo?.requires_fee"
                 class="rounded-xl p-3 mb-5 flex gap-2 items-start"
                 style="background:hsl(0,84%,60%,0.08);border:1px solid hsl(0,84%,60%,0.25)">
              <span class="material-icons flex-shrink-0" style="font-size:1rem;color:hsl(0,72%,51%);margin-top:1px">warning</span>
              <p class="text-xs leading-relaxed" style="color:hsl(0,72%,40%)">
                Fora do prazo de cancelamento gratuito. Multa: <strong>R\${{ cancelInfo?.fee_amount | number:'1.2-2' }}</strong>.
                Reembolso: <strong>R\${{ cancelInfo?.refund_amount | number:'1.2-2' }}</strong>.
              </p>
            </div>

            <button class="btn-confirm-cancel"
                    [disabled]="cancelling"
                    (click)="confirmCancelBooking()">
              <span *ngIf="cancelling" class="material-icons"
                    style="font-size:1rem;vertical-align:middle;margin-right:0.3rem;animation:spin 1s linear infinite">
                refresh
              </span>
              {{ cancelling ? 'Cancelando...' : 'Sim, cancelar reserva' }}
            </button>
            <button class="btn-back-modal" (click)="showCancelModal = false">Voltar</button>

          </div>
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

    <!-- ══════════ MENSALISTA FLOW MODAL ══════════ -->
    <div class="modal-overlay" *ngIf="mensalistaModal" (click)="closeMensalistaFlow()">
      <div class="modal-sheet" style="max-width:420px" (click)="$event.stopPropagation()">

        <!-- ── Etapa 1: Regras ── -->
        <ng-container *ngIf="mensalistaStep === 'rules'">
          <div class="text-center mb-5">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                 style="background:var(--primary)">
              <span class="material-icons text-white" style="font-size:1.75rem">repeat</span>
            </div>
            <h3 class="font-heading font-bold text-lg" style="color:var(--foreground)">Como funciona o Mensalista</h3>
          </div>

          <div class="space-y-3 mb-5">
            <div class="flex items-start gap-3">
              <span class="material-icons flex-shrink-0 mt-0.5" style="font-size:1.1rem;color:var(--primary)">event_repeat</span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--foreground)">Horário fixo semanal</p>
                <p class="text-xs" style="color:var(--muted-foreground)">Você escolhe um dia da semana e horário que repetem toda semana.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-icons flex-shrink-0 mt-0.5" style="font-size:1.1rem;color:var(--primary)">payments</span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--foreground)">Pagamento mensal por PIX</p>
                <p class="text-xs" style="color:var(--muted-foreground)">O valor é o mesmo por hora da quadra, cobrado para garantir 1 mês de vigência.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-icons flex-shrink-0 mt-0.5" style="font-size:1.1rem;color:var(--primary)">block</span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--foreground)">Slot bloqueado na arena</p>
                <p class="text-xs" style="color:var(--muted-foreground)">Ninguém mais consegue reservar esse horário enquanto você for mensalista.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-icons flex-shrink-0 mt-0.5" style="font-size:1.1rem;color:var(--primary)">cancel</span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--foreground)">Cancele quando quiser</p>
                <p class="text-xs" style="color:var(--muted-foreground)">Você pode cancelar a qualquer momento pelo app. Caso já tenha pago, o reembolso é automático.</p>
              </div>
            </div>
          </div>

          <button class="btn-primary w-full" (click)="mensalistaStep = 'select'">
            Escolher dia e horário
          </button>
          <button class="btn-back-modal" (click)="closeMensalistaFlow()">Fechar</button>
        </ng-container>

        <!-- ── Etapa 2: Selecionar quadra, dia, horário ── -->
        <ng-container *ngIf="mensalistaStep === 'select'">
          <button class="btn-ghost mb-3 px-0 -ml-1 text-sm" (click)="mensalistaStep = 'rules'">
            <span class="material-icons" style="font-size:1rem">arrow_back</span> Voltar
          </button>
          <h3 class="font-heading font-bold text-base mb-4" style="color:var(--foreground)">Configurar mensalista</h3>

          <!-- Nome do grupo (obrigatório) -->
          <div class="mb-4">
            <label class="block text-xs font-semibold mb-1.5" style="color:var(--muted-foreground)">
              NOME DO GRUPO <span style="color:hsl(0,72%,51%)">*</span>
            </label>
            <div style="position:relative">
              <span class="material-icons" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted-foreground);pointer-events:none">group</span>
              <input class="input" style="padding-left:2.25rem"
                     [(ngModel)]="mensalistaForm.group_name"
                     placeholder="Ex: Grupo da Manhã, Rapazeada FTV..."
                     maxlength="60">
            </div>
            <p class="text-xs mt-1"
               [style.color]="mensalistaForm.group_name.trim() ? 'var(--muted-foreground)' : 'hsl(0,72%,51%)'">
              {{ mensalistaForm.group_name.trim() ? 'Será exibido na sua lista de mensalistas.' : 'Obrigatório — dê um nome para o seu grupo.' }}
            </p>
          </div>

          <!-- Quadra -->
          <div class="mb-4">
            <label class="block text-xs font-semibold mb-2" style="color:var(--muted-foreground)">QUADRA</label>
            <div class="mc-cards-grid">
              <button *ngFor="let c of availableCourts"
                      type="button"
                      class="mc-card"
                      [class.mc-card--selected]="mensalistaForm.court_id === c.id"
                      (click)="mensalistaForm.court_id = c.id; loadMensalistaSlots()">
                <div class="mc-card-icon">
                  <span class="material-icons">{{ sportIcon(c.sport_type) }}</span>
                </div>
                <div class="mc-card-body">
                  <span class="mc-card-name">{{ c.name }}</span>
                  <span class="mc-card-rate">{{ mensalistaRateLabel(c) }}</span>
                </div>
                <span class="material-icons mc-card-check">check_circle</span>
              </button>
            </div>
          </div>

          <!-- Dia da semana -->
          <div class="mb-4">
            <label class="block text-xs font-semibold mb-1.5" style="color:var(--muted-foreground)">DIA DA SEMANA</label>
            <div class="flex gap-1 flex-wrap">
              <button *ngFor="let d of dayOptions"
                      type="button"
                      class="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
                      [style]="mensalistaForm.day_of_week === d.value
                        ? 'background:var(--primary);color:white;border-color:var(--primary)'
                        : 'background:transparent;color:var(--muted-foreground);border-color:var(--border)'"
                      (click)="mensalistaForm.day_of_week = d.value; loadMensalistaSlots()">
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- Seletor de horário (pills) -->
          <div class="mb-5" *ngIf="mensalistaForm.court_id">
            <!-- Instrução contextual -->
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold" style="color:var(--muted-foreground)">
                {{ mensalistaSlotStep === 'start' ? 'SELECIONE O INÍCIO' : 'SELECIONE O FIM' }}
              </label>
              <button *ngIf="mensalistaForm.start_hour && mensalistaSlotStep === 'end'"
                      type="button"
                      class="alterar-inicio-chip"
                      (click)="mensalistaSlotStep = 'start'; mensalistaForm.start_hour = ''; mensalistaForm.end_hour = ''">
                <span class="material-icons" style="font-size:0.75rem">edit</span>
                Alterar início
              </button>
            </div>

            <!-- Loading -->
            <div *ngIf="mensalistaSlotsLoading" class="flex items-center justify-center py-4">
              <span class="material-icons animate-spin text-sm mr-2" style="color:var(--primary);animation:spin 1s linear infinite">autorenew</span>
              <span class="text-xs" style="color:var(--muted-foreground)">Verificando disponibilidade…</span>
            </div>

            <!-- Grid de horas -->
            <div *ngIf="!mensalistaSlotsLoading" class="mensalista-grid">
              <button *ngFor="let h of hours"
                      type="button"
                      class="slot-btn"
                      [ngClass]="getMensalistaHourStatus(h)"
                      [disabled]="isMensalistaHourDisabled(h)"
                      (click)="onMensalistaHourClick(h)">
                <span>{{ h }}</span>
                <span *ngIf="getMensalistaHourStatus(h) === 'mensalista'" class="slot-label-hint" style="font-size:0.48rem">Mensalista</span>
                <span *ngIf="getMensalistaHourStatus(h) === 'start'" class="slot-label-hint">início</span>
                <span *ngIf="getMensalistaHourStatus(h) === 'end'"   class="slot-label-hint">fim</span>
              </button>
            </div>

            <!-- Legenda -->
            <div *ngIf="!mensalistaSlotsLoading" class="slot-legend mt-2">
              <div class="legend-item">
                <div class="legend-swatch" style="background:var(--primary)"></div>
                Selecionado
              </div>
              <div class="legend-item">
                <div class="legend-swatch" style="background:hsl(152,69%,40%,0.13);border:1px solid hsl(152,69%,40%,0.35)"></div>
                Intervalo
              </div>
              <div class="legend-item">
                <div class="legend-swatch" style="background:hsl(36,95%,55%,0.1);border:1px solid hsl(36,95%,55%,0.4)"></div>
                Mensalista
              </div>
            </div>
          </div>

          <!-- Placeholder antes de escolher quadra -->
          <div *ngIf="!mensalistaForm.court_id" class="rounded-xl p-4 mb-5 text-center"
               style="background:var(--muted)">
            <span class="text-xs" style="color:var(--muted-foreground)">Selecione uma quadra para ver os horários disponíveis.</span>
          </div>

          <!-- Resumo do valor -->
          <div *ngIf="mensalistaForm.start_hour && mensalistaForm.end_hour"
               class="rounded-xl p-3 mb-4" style="background:hsl(152,69%,40%,0.07);border:1px solid hsl(152,69%,40%,0.2)">
            <div class="flex justify-between text-sm">
              <span style="color:var(--muted-foreground)">{{ dayName(mensalistaForm.day_of_week) }} · {{ mensalistaForm.start_hour }}–{{ mensalistaForm.end_hour }}</span>
              <span class="font-semibold" style="color:var(--foreground)">{{ mensalistaDuration }}h</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span style="color:var(--muted-foreground)">Valor mensal</span>
              <span class="font-heading font-bold" style="color:var(--primary)">R\${{ mensalistaTotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <button class="btn-primary w-full"
                  [disabled]="!mensalistaForm.group_name.trim() || !mensalistaForm.court_id || mensalistaForm.day_of_week === undefined || !mensalistaForm.start_hour || !mensalistaForm.end_hour"
                  (click)="mensalistaStep = 'disclaimer'">
            Gerar PIX de pagamento
          </button>
          <button class="btn-back-modal" (click)="closeMensalistaFlow()">Cancelar</button>
        </ng-container>

        <!-- ── Etapa 2.5: Aviso de não estorno ── -->
        <ng-container *ngIf="mensalistaStep === 'disclaimer'">
          <div class="text-center mb-5">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                 style="background:hsl(36,95%,55%,0.12)">
              <span class="material-icons" style="font-size:1.6rem;color:hsl(36,80%,40%)">gavel</span>
            </div>
            <h3 class="font-heading font-bold text-lg mb-1" style="color:var(--foreground)">Antes de prosseguir</h3>
            <p class="text-sm" style="color:var(--muted-foreground)">Leia com atenção antes de gerar o PIX</p>
          </div>

          <!-- Aviso -->
          <div class="rounded-xl p-4 mb-5 text-sm leading-relaxed"
               style="background:hsl(36,95%,55%,0.08);border:1px solid hsl(36,95%,55%,0.3);color:hsl(36,55%,30%)">
            <div class="flex items-start gap-2.5">
              <span class="material-icons flex-shrink-0 mt-0.5" style="font-size:1.1rem">warning_amber</span>
              <div>
                <p class="font-semibold mb-1.5">Pagamento sem direito a estorno</p>
                <p>O valor pago pela mensalidade <strong>não poderá ser estornado</strong> após a confirmação do pagamento. Ao seguir, você concorda com esta condição.</p>
              </div>
            </div>
          </div>

          <!-- Resumo do plano selecionado -->
          <div class="rounded-xl p-4 mb-5 space-y-2 text-sm" style="background:var(--muted)">
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Quadra</span>
              <span class="font-medium" style="color:var(--foreground)">{{ courtName(mensalistaForm.court_id) }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Horário</span>
              <span class="font-medium" style="color:var(--foreground)">{{ mensalistaForm.start_hour }} – {{ mensalistaForm.end_hour }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Valor mensal</span>
              <span class="font-heading font-bold" style="color:var(--primary)">R\${{ mensalistaTotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <button class="btn-primary w-full flex items-center justify-center gap-2"
                  [disabled]="mensalistaCreating"
                  (click)="confirmMensalista()">
            <span class="material-icons" style="font-size:1rem"
                  [style.animation]="mensalistaCreating ? 'spin 1s linear infinite' : 'none'">
              {{ mensalistaCreating ? 'refresh' : 'check_circle' }}
            </span>
            {{ mensalistaCreating ? 'Gerando PIX...' : 'Concordo, seguir para pagamento' }}
          </button>
          <button class="btn-back-modal"
                  [disabled]="mensalistaCreating"
                  (click)="closeMensalistaFlow()">
            Não concordo, cancelar plano
          </button>
        </ng-container>

        <!-- ── Etapa 3: PIX gerado ── -->
        <ng-container *ngIf="mensalistaStep === 'pix' && createdMensalista">
          <div class="text-center mb-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                 style="background:hsl(152,69%,40%,0.1)">
              <span class="material-icons" style="font-size:1.75rem;color:var(--primary)">qr_code_2</span>
            </div>
            <h3 class="font-heading font-bold text-lg mb-1" style="color:var(--foreground)">PIX gerado!</h3>
            <p class="text-xs" style="color:var(--muted-foreground)">
              Efetue o pagamento para ativar seu horário fixo de
              <strong>{{ dayName(createdMensalista.day_of_week) }}</strong>
              das {{ createdMensalista.start_hour }}–{{ createdMensalista.end_hour }}.
            </p>
          </div>

          <!-- QR Code -->
          <div class="flex justify-center mb-4" *ngIf="createdMensalista.pix_qr_code_url">
            <img [src]="createdMensalista.pix_qr_code_url"
                 alt="QR Code PIX Mensalista"
                 style="width:180px;height:180px;border-radius:1rem;border:3px solid var(--primary)">
          </div>

          <!-- Copia e cola -->
          <div *ngIf="createdMensalista.pix_qr_code" class="rounded-xl p-3 mb-4"
               style="background:var(--muted);word-break:break-all">
            <p class="text-xs font-medium mb-1.5" style="color:var(--muted-foreground)">Código Pix copia e cola:</p>
            <p class="text-xs font-mono leading-relaxed" style="color:var(--foreground)">
              {{ createdMensalista.pix_qr_code | slice:0:80 }}...
            </p>
            <button class="btn-outline w-full mt-2 text-xs flex items-center justify-center gap-1"
                    style="padding:0.45rem"
                    (click)="copyMensalistaPixCode()">
              <span class="material-icons" style="font-size:0.85rem">content_copy</span>
              Copiar código
            </button>
          </div>

          <p class="text-xs text-center mb-4" style="color:var(--muted-foreground)">
            Após o pagamento, seu horário será ativado automaticamente. Você pode acompanhar em <strong>Reservas → Mensalistas</strong>.
          </p>

          <!-- Indicador de aguardando pagamento -->
          <div class="flex items-center justify-center gap-2 py-2 rounded-xl mb-4"
               style="background:var(--muted)">
            <span class="material-icons text-sm animate-spin" style="color:var(--primary);animation:spin 1.2s linear infinite">autorenew</span>
            <span class="text-xs font-medium" style="color:var(--muted-foreground)">Aguardando confirmação do pagamento…</span>
          </div>

          <button class="btn-outline w-full text-sm" (click)="closeMensalistaFlow()">
            Fechar — acompanhar em Reservas
          </button>
        </ng-container>

        <!-- ── Etapa 4: Pagamento confirmado ── -->
        <ng-container *ngIf="mensalistaStep === 'confirmed' && createdMensalista">
          <div class="text-center mb-5">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                 style="background:hsl(152,69%,40%,0.12)">
              <span class="material-icons" style="font-size:2rem;color:var(--primary)">check_circle</span>
            </div>
            <h3 class="font-heading font-bold text-xl mb-1" style="color:var(--foreground)">Mensalista ativado!</h3>
            <p class="text-sm" style="color:var(--muted-foreground)">
              Seu horário fixo foi confirmado e está garantido toda semana.
            </p>
          </div>

          <!-- Resumo -->
          <div class="rounded-xl p-4 mb-5 space-y-2" style="background:var(--muted)">
            <div class="flex justify-between text-sm" *ngIf="createdMensalista.group_name">
              <span style="color:var(--muted-foreground)">Grupo</span>
              <span class="font-semibold" style="color:var(--foreground)">{{ createdMensalista.group_name }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color:var(--muted-foreground)">Quadra</span>
              <span class="font-medium" style="color:var(--foreground)">{{ createdMensalista.court.name }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color:var(--muted-foreground)">Dia</span>
              <span class="font-medium" style="color:var(--foreground)">{{ dayName(createdMensalista.day_of_week) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color:var(--muted-foreground)">Horário</span>
              <span class="font-medium" style="color:var(--foreground)">{{ createdMensalista.start_hour }}–{{ createdMensalista.end_hour }}</span>
            </div>
            <div class="flex justify-between text-sm" *ngIf="createdMensalista.valid_until">
              <span style="color:var(--muted-foreground)">Válido até</span>
              <span class="font-semibold" style="color:var(--primary)">
                {{ createdMensalista.valid_until | date:'dd/MM/yyyy' }}
              </span>
            </div>
          </div>

          <p class="text-xs text-center mb-4" style="color:var(--muted-foreground)">
            Acompanhe e gerencie em <strong>Reservas → Mensalistas</strong>.
          </p>

          <button class="btn-primary w-full" (click)="closeMensalistaFlow()">
            Concluir
          </button>
        </ng-container>

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

  // Cancel flow
  cancelInfo:        CancelPreview | null = null;
  cancelInfoLoading  = false;
  showCancelModal    = false;
  cancelling         = false;

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

  /**
   * Verifica se o intervalo [startHour, endHour) conflita com qualquer slot ocupado.
   * Usa solapamento estrito: slot.start < endHour AND slot.end > startHour
   * Isso garante que [7h,8h] não conflita com mensalista [8h,10h] (8 < 8 é FALSO).
   */
  private wouldConflict(startHour: string, endHour: string): boolean {
    return this.data.isSlotOccupied(
      this.arena.id, this.form.court_id, this.form.date, startHour, endHour
    );
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

    // Verifica se o intervalo [start, h] conflita com qualquer slot ocupado.
    // Ex: start=7h, h=8h, mensalista=[8h,10h] → 8<8 é FALSO → sem conflito → 8h liberado.
    // Ex: start=7h, h=9h, mensalista=[8h,10h] → 8<9 E 10>7 → conflito → 9h bloqueado.
    if (this.wouldConflict(this.form.start_hour, hour)) return 'blocked';

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

  // ── Mensalista state ──────────────────────────────────────────────────────
  mensalistaModal   = false;
  mensalistaStep: 'rules' | 'select' | 'disclaimer' | 'pix' | 'confirmed' = 'rules';
  mensalistaCreating   = false;
  mensalistaSlotsLoading = false;
  mensalistaSlotStep: 'start' | 'end' = 'start';
  mensalistaBlockedSlots: { start_hour: string; end_hour: string }[] = [];
  createdMensalista: MensalistaResult | null = null;
  private mensalistaPollInterval: any = null;
  private mensalistaPollCount   = 0;
  mensalistaForm = {
    court_id:    '',
    group_name:  '',
    day_of_week: 1 as number,
    start_hour:  '',
    end_hour:    '',
  };

  readonly dayOptions = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ];

  get mensalistaDay(): string {
    return this.dayOptions[this.mensalistaForm.day_of_week]?.label ?? '';
  }

  get mensalistaEndHours(): string[] {
    if (!this.mensalistaForm.start_hour) return [];
    return this.hours.filter(h => h > this.mensalistaForm.start_hour);
  }

  get mensalistaDuration(): number {
    if (!this.mensalistaForm.start_hour || !this.mensalistaForm.end_hour) return 0;
    return parseInt(this.mensalistaForm.end_hour) - parseInt(this.mensalistaForm.start_hour);
  }

  get mensalistaTotal(): number {
    const court = this.availableCourts.find(c => c.id === this.mensalistaForm.court_id);
    const rate  = court?.mensalista_rate ?? court?.hourly_rate ?? 0;
    return this.mensalistaDuration * rate * 4;
  }

  /** Ícone Material para o tipo de esporte da quadra. */
  sportIcon(sportType: string): string {
    const icons: Record<string, string> = {
      'vôlei':       'sports_volleyball',
      'futevôlei':   'sports_volleyball',
      'beach tennis':'sports_tennis',
      'futebol':     'sports_soccer',
      'ambos':       'grid_view',
    };
    return icons[sportType] ?? 'sports';
  }

  /** Texto do preço a exibir para o plano mensalista da quadra. */
  mensalistaRateLabel(court: Court): string {
    if (court.mensalista_rate) {
      return `R\$${court.mensalista_rate}/h mensalista`;
    }
    return `R\$${court.hourly_rate}/h`;
  }

  dayName(day: number): string {
    return this.dayOptions[day]?.label ?? String(day);
  }

  onMensalistaStartChange(): void {
    this.mensalistaForm.end_hour = '';
  }

  /** Carrega os slots bloqueados do backend (quadra + dia selecionados). */
  async loadMensalistaSlots(): Promise<void> {
    const { court_id, day_of_week } = this.mensalistaForm;
    if (!court_id) { this.mensalistaBlockedSlots = []; return; }
    this.mensalistaSlotsLoading = true;
    // Reseta seleção de hora ao mudar quadra/dia
    this.mensalistaForm.start_hour = '';
    this.mensalistaForm.end_hour   = '';
    this.mensalistaSlotStep        = 'start';
    try {
      this.mensalistaBlockedSlots = await this.mensalistaService.getSlots(court_id, day_of_week);
    } catch {
      this.mensalistaBlockedSlots = [];
    } finally {
      this.mensalistaSlotsLoading = false;
    }
  }

  /**
   * Retorna o estado visual de cada hora no seletor do mensalista.
   * Estados: 'mensalista' | 'available' | 'available-end' | 'start' | 'end' | 'in-range' | 'blocked'
   */
  getMensalistaHourStatus(h: string): string {
    const hInt = parseInt(h);
    const { start_hour, end_hour } = this.mensalistaForm;

    if (this.mensalistaSlotStep === 'start') {
      // Última hora (23:00) não pode ser início
      if (hInt >= 23) return 'blocked';
      // Bloqueado por mensalista existente
      const isMensalista = this.mensalistaBlockedSlots.some(
        m => hInt >= parseInt(m.start_hour) && hInt < parseInt(m.end_hour)
      );
      if (isMensalista) return 'mensalista';
      if (h === start_hour) return 'start';
      return 'available';
    } else {
      // Selecionando fim — início já escolhido
      const sInt = parseInt(start_hour);
      if (hInt <= sInt) return 'blocked'; // fim deve ser depois do início
      // Verifica overlap com mensalista existente: [start, h] vs [ms, me]
      // Overlap se: sInt < me E hInt > ms
      const wouldOverlap = this.mensalistaBlockedSlots.some(
        m => sInt < parseInt(m.end_hour) && hInt > parseInt(m.start_hour)
      );
      if (wouldOverlap) return 'mensalista';
      if (h === end_hour)                                       return 'end';
      if (end_hour && hInt > sInt && hInt < parseInt(end_hour)) return 'in-range';
      // Seleção concluída: horas após o fim ficam neutras (cinza)
      if (end_hour && hInt > parseInt(end_hour))                return 'blocked';
      return 'available-end';
    }
  }

  isMensalistaHourDisabled(h: string): boolean {
    const s = this.getMensalistaHourStatus(h);
    return s === 'mensalista' || s === 'blocked';
  }

  onMensalistaHourClick(h: string): void {
    if (this.isMensalistaHourDisabled(h)) return;
    if (this.mensalistaSlotStep === 'start') {
      this.mensalistaForm.start_hour = h;
      this.mensalistaForm.end_hour   = '';
      this.mensalistaSlotStep        = 'end';
    } else {
      this.mensalistaForm.end_hour = h;
      // Mantém no step 'end' para permitir re-seleção do fim
    }
  }

  openMensalistaFlow(): void {
    this.mensalistaModal        = true;
    this.mensalistaStep         = 'rules';
    this.mensalistaSlotStep     = 'start';
    this.mensalistaBlockedSlots = [];
    this.createdMensalista      = null;
    this.mensalistaForm         = { court_id: '', group_name: '', day_of_week: 1, start_hour: '', end_hour: '' };
    // Pré-carrega se já houver só uma quadra
    if (this.availableCourts.length === 1) {
      this.mensalistaForm.court_id = this.availableCourts[0].id;
      this.loadMensalistaSlots();
    }
  }

  closeMensalistaFlow(): void {
    this.stopMensalistaPolling();
    this.mensalistaModal = false;
  }

  courtName(courtId: string): string {
    return this.courts.find(c => c.id === courtId)?.name ?? 'Quadra';
  }

  /** Faixa de tarifas mensalista para exibição no CTA card (ex: "R$3" ou "R$3–5"). */
  mensalistaCTARateLabel(): string {
    const rates = this.courts
      .map(c => c.mensalista_rate ?? c.hourly_rate)
      .filter(r => r != null) as number[];
    if (!rates.length) return 'R$–';
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    return min === max ? `R\$${min}` : `R\$${min}–${max}`;
  }

  async confirmMensalista(): Promise<void> {
    const { court_id, group_name, day_of_week, start_hour, end_hour } = this.mensalistaForm;
    if (!group_name.trim() || !court_id || day_of_week === undefined || !start_hour || !end_hour) return;
    if (this.mensalistaCreating) return;

    this.mensalistaCreating = true;
    try {
      const profile = this.userProfile.getProfile();
      const result = await this.mensalistaService.create({
        court_id,
        day_of_week,
        start_hour,
        end_hour,
        client_name:      profile.name  || this.auth.user()?.displayName || 'Cliente',
        client_phone:     profile.phone || undefined,
        client_document:  profile.cpf   || undefined,
        group_name:       group_name.trim() || undefined,
      });
      this.createdMensalista = result;
      this.mensalistaStep    = 'pix';
      this.startMensalistaPolling(result.id);
    } catch (err: any) {
      this.toast.show(err?.error?.error || 'Erro ao criar mensalista. Tente novamente.');
    } finally {
      this.mensalistaCreating = false;
    }
  }

  copyMensalistaPixCode(): void {
    if (!this.createdMensalista?.pix_qr_code) return;
    navigator.clipboard.writeText(this.createdMensalista.pix_qr_code)
      .then(() => this.toast.show('Código PIX copiado!'));
  }

  startMensalistaPolling(mensalistaId: string): void {
    this.stopMensalistaPolling();
    this.mensalistaPollCount = 0;
    this.mensalistaPollInterval = setInterval(async () => {
      this.mensalistaPollCount++;
      // Timeout após 10 min (120 polls × 5s)
      if (this.mensalistaPollCount > 120) {
        this.stopMensalistaPolling();
        return;
      }
      try {
        // getSilent → não dispara loading global; só atualiza UI ao confirmar pagamento
        const fresh = await this.mensalistaService.getOneSilent(mensalistaId);
        if (fresh.payment_status === 'PAGO') {
          this.createdMensalista = fresh;
          this.stopMensalistaPolling();
          this.mensalistaStep = 'confirmed';
          this.toast.show('Pagamento confirmado! Mensalista ativado ✅');
        }
      } catch { /* ignora — mantém tela atual */ }
    }, 5000);
  }

  stopMensalistaPolling(): void {
    if (this.mensalistaPollInterval) {
      clearInterval(this.mensalistaPollInterval);
      this.mensalistaPollInterval = null;
    }
  }

  constructor(private data: DataService, private toast: ToastService, public auth: AuthService, private userProfile: UserProfileService, private bookingService: BookingService, private arenaService: ArenaService, private reviewService: ReviewService, private mensalistaService: MensalistaService) {}

  get arenaAvgRating(): number {
    if (!this.arenaReviews.length) return 0;
    const avg = this.arenaReviews.reduce((s: number, r: any) => s + r.stars, 0) / this.arenaReviews.length;
    return Math.round(avg * 10) / 10;
  }

  ngOnDestroy(): void {
    this.stopPaymentPolling();
    this.stopMensalistaPolling();
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

  private get bookingStatus(): string {
    return this.confirmedBooking?.payment_status?.toUpperCase() ?? 'PENDENTE';
  }

  get bookingStatusTitle(): string {
    const map: Record<string, string> = {
      PAGO:      'Reserva totalmente paga!',
      PARCIAL:   'Quadra confirmada!',
      PENDENTE:  'Aguardando pagamentos',
    };
    return map[this.bookingStatus] ?? 'Aguardando pagamentos';
  }

  get bookingStatusDesc(): string {
    const map: Record<string, string> = {
      PAGO:     'Todos pagaram. Até a quadra! 🎉',
      PARCIAL:  'Mais de 50% pago. A quadra está garantida.',
      PENDENTE: 'A quadra será confirmada ao atingir 50% do valor.',
    };
    return map[this.bookingStatus] ?? 'A quadra será confirmada ao atingir 50% do valor.';
  }

  get bookingStatusLabel(): string {
    const map: Record<string, string> = {
      PAGO:     'Pago ✓',
      PARCIAL:  'Confirmado ✓',
      PENDENTE: 'Pendente',
    };
    return map[this.bookingStatus] ?? 'Pendente';
  }

  get bookingStatusIcon(): string {
    const map: Record<string, string> = {
      PAGO:     'verified',
      PARCIAL:  'check_circle',
      PENDENTE: 'schedule',
    };
    return map[this.bookingStatus] ?? 'schedule';
  }

  get bookingStatusColor(): string {
    const map: Record<string, string> = {
      PAGO:     'var(--primary)',
      PARCIAL:  'var(--primary)',
      PENDENTE: 'hsl(45,93%,47%)',
    };
    return map[this.bookingStatus] ?? 'hsl(45,93%,47%)';
  }

  get bookingStatusBg(): string {
    const map: Record<string, string> = {
      PAGO:     'hsl(152,69%,40%,0.08)',
      PARCIAL:  'hsl(152,69%,40%,0.08)',
      PENDENTE: 'hsl(45,93%,47%,0.08)',
    };
    return map[this.bookingStatus] ?? 'hsl(45,93%,47%,0.08)';
  }

  get bookingStatusBorder(): string {
    const map: Record<string, string> = {
      PAGO:     'var(--primary)',
      PARCIAL:  'var(--primary)',
      PENDENTE: 'hsl(45,93%,47%)',
    };
    return map[this.bookingStatus] ?? 'hsl(45,93%,47%)';
  }

  get bookingStatusIconBg(): string {
    const map: Record<string, string> = {
      PAGO:     'hsl(152,69%,40%,0.15)',
      PARCIAL:  'hsl(152,69%,40%,0.15)',
      PENDENTE: 'hsl(45,93%,47%,0.15)',
    };
    return map[this.bookingStatus] ?? 'hsl(45,93%,47%,0.15)';
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
      this.cancelInfo       = null; // reseta preview anterior

      // Carrega política de cancelamento em background (sem bloquear o fluxo)
      this.loadCancelPreview();

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
        } else {
          // Atualiza o preview de cancelamento para refletir se a janela gratuita já expirou.
          // Usa versão silenciosa para não acionar o loader global.
          try {
            this.cancelInfo = await this.bookingService.getCancelPreviewSilent(bookingId);
          } catch { /* mantém o cancelInfo atual em caso de erro */ }
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
    split.regenerating = true;
    try {
      const updated = await this.bookingService.regenerateSplit(this.confirmedBooking.id, split.id);
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
      split.regenerating = false;
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
    this.cancelInfo           = null;
    this.showCancelModal      = false;
    this.cancelling           = false;
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

  /* ── Cancel flow ─────────────────────────────────────────────────── */

  /** Carrega o preview de cancelamento em background após o booking ser criado. */
  private async loadCancelPreview(): Promise<void> {
    if (!this.confirmedBooking) return;
    this.cancelInfoLoading = true;
    try {
      this.cancelInfo = await this.bookingService.getCancelPreviewSilent(this.confirmedBooking.id);
    } catch { /* silencioso — botão aparece como "Cancelar reserva" por padrão */ }
    finally { this.cancelInfoLoading = false; }
  }

  /** Abre o fluxo de cancelamento: mostra toast informativo (se houver taxa) e exibe o modal. */
  async openCancelFlow(): Promise<void> {
    if (!this.confirmedBooking || this.cancelling) return;

    // Carrega preview se ainda não tiver (fallback para o caso do load silencioso ter falhado)
    if (!this.cancelInfo) {
      this.cancelInfoLoading = true;
      try {
        this.cancelInfo = await this.bookingService.getCancelPreview(this.confirmedBooking.id);
      } catch {
        this.toast.show('Não foi possível verificar a política de cancelamento. Tente novamente.');
        this.cancelInfoLoading = false;
        return;
      }
      this.cancelInfoLoading = false;
    }

    // Toast informativo apenas quando há taxa
    if (this.cancelInfo.requires_fee) {
      const fee     = this.cancelInfo.fee_amount.toFixed(2).replace('.', ',');
      const refund  = this.cancelInfo.refund_amount.toFixed(2).replace('.', ',');
      this.toast.show(
        `Atenção: cancelamento fora do prazo da unidade. Taxa de cancelamento: R$${fee}. Reembolso: R$${refund}.`
      );
    }

    this.showCancelModal = true;
  }

  /** Confirma e executa o cancelamento via API. */
  async confirmCancelBooking(): Promise<void> {
    if (!this.confirmedBooking || this.cancelling) return;
    this.cancelling = true;
    try {
      await this.bookingService.cancelBooking(this.confirmedBooking.id);
      this.showCancelModal = false;
      this.toast.show('Reserva cancelada com sucesso.');
      setTimeout(() => this.resetToArena(), 400);
    } catch (err: any) {
      this.toast.show(err?.error?.error || 'Erro ao cancelar. Tente novamente.');
    } finally {
      this.cancelling = false;
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
