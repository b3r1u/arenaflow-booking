import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from './pages/search/search.component';
import { ArenaDetailComponent } from './pages/arena-detail/arena-detail.component';
import { MyBookingsComponent } from './pages/booking/booking.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { ToastService } from './services/toast.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { UserProfileService } from './services/user-profile.service';
import { Arena } from './models/models';

type View = 'search' | 'arena' | 'my-bookings' | 'profile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, ArenaDetailComponent, MyBookingsComponent, UserProfileComponent, LoginComponent],
  template: `
    <div style="background-color:var(--background);min-height:100vh">

      <!-- Loading auth state -->
      <div *ngIf="auth.loading()" class="min-h-screen flex items-center justify-center"
           style="background:var(--background)">
        <div class="vb-center">
          <div class="vb-ball-wrap">
            <div class="vb-glow"></div>
            <svg class="vb-ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="43" fill="none" stroke="var(--primary)" stroke-width="3"/>
              <circle cx="50" cy="50" r="43" fill="var(--primary)" opacity="0.08"/>
              <path d="M 7,50 C 7,22 93,22 93,50" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 7,50 C 7,78 93,78 93,50" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 31,9 C 12,38 12,62 31,91"  fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 69,9 C 88,38 88,62 69,91"  fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="vb-label">Entrando...</p>
        </div>
      </div>

      <!-- HTTP loading overlay -->
      <div *ngIf="loading.isLoading()" class="vb-overlay">
        <div class="vb-center">
          <div class="vb-ball-wrap">
            <div class="vb-glow"></div>
            <svg class="vb-ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="43" fill="none" stroke="var(--primary)" stroke-width="3"/>
              <circle cx="50" cy="50" r="43" fill="var(--primary)" opacity="0.08"/>
              <path d="M 7,50 C 7,22 93,22 93,50" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 7,50 C 7,78 93,78 93,50" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 31,9 C 12,38 12,62 31,91"  fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M 69,9 C 88,38 88,62 69,91"  fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="vb-label">Carregando...</p>
        </div>
      </div>

      <!-- Not logged in -->
      <app-login *ngIf="!auth.loading() && !auth.user()"></app-login>

      <!-- Card de boas-vindas: pede CPF e celular na primeira vez -->
      <div *ngIf="!auth.loading() && auth.user() && showProfileCard"
           class="vb-overlay" style="z-index:500">
        <div style="
          background:var(--card);
          border:1px solid var(--border);
          border-radius:1.25rem;
          padding:2rem 1.5rem;
          max-width:380px;
          width:90%;
          box-shadow:0 20px 60px rgba(0,0,0,0.35);
          animation:vb-fade-in 0.25s ease;
        ">
          <!-- Ícone -->
          <div style="display:flex;justify-content:center;margin-bottom:1.25rem">
            <div style="
              width:56px;height:56px;border-radius:50%;
              background:var(--primary);
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 4px 16px hsl(152,69%,40%,0.35)
            ">
              <span class="material-icons" style="color:#fff;font-size:1.75rem">person_outline</span>
            </div>
          </div>

          <h2 style="text-align:center;font-size:1.15rem;font-weight:700;color:var(--foreground);margin:0 0 0.4rem">
            Bem-vindo, {{ (auth.user()?.displayName || 'atleta').split(' ')[0] }}! 👋
          </h2>
          <p style="text-align:center;font-size:0.82rem;color:var(--muted-foreground);margin:0 0 1.5rem;line-height:1.5">
            Complete seu perfil para reservar quadras sem precisar preencher esses dados toda vez.
          </p>

          <!-- CPF -->
          <div style="margin-bottom:1rem">
            <label style="font-size:0.78rem;font-weight:600;color:var(--muted-foreground);display:block;margin-bottom:0.35rem">CPF</label>
            <input
              [(ngModel)]="profileForm.cpf"
              type="text"
              placeholder="000.000.000-00"
              maxlength="14"
              (input)="maskCpf($event)"
              style="
                width:100%;box-sizing:border-box;
                padding:0.65rem 0.9rem;
                border:1px solid var(--border);
                border-radius:0.6rem;
                background:var(--background);
                color:var(--foreground);
                font-size:0.9rem;
                outline:none;
              "
            />
          </div>

          <!-- Celular -->
          <div style="margin-bottom:1.5rem">
            <label style="font-size:0.78rem;font-weight:600;color:var(--muted-foreground);display:block;margin-bottom:0.35rem">Celular</label>
            <input
              [(ngModel)]="profileForm.phone"
              type="tel"
              placeholder="(00) 00000-0000"
              maxlength="15"
              (input)="maskPhone($event)"
              style="
                width:100%;box-sizing:border-box;
                padding:0.65rem 0.9rem;
                border:1px solid var(--border);
                border-radius:0.6rem;
                background:var(--background);
                color:var(--foreground);
                font-size:0.9rem;
                outline:none;
              "
            />
          </div>

          <!-- Botões -->
          <button
            (click)="saveProfileCard()"
            [disabled]="savingProfile"
            style="
              width:100%;padding:0.75rem;
              background:var(--primary);color:#fff;
              border:none;border-radius:0.75rem;
              font-size:0.95rem;font-weight:700;
              cursor:pointer;margin-bottom:0.65rem;
              opacity: savingProfile ? 0.7 : 1;
            ">
            {{ savingProfile ? 'Salvando...' : 'Salvar e continuar' }}
          </button>
          <button
            (click)="skipProfileCard()"
            style="
              width:100%;padding:0.5rem;
              background:transparent;color:var(--muted-foreground);
              border:none;font-size:0.82rem;cursor:pointer;
            ">
            Preencher depois
          </button>
        </div>
      </div>

      <!-- Logged in -->
      <ng-container *ngIf="!auth.loading() && auth.user()">

        <!-- Header -->
        <header class="sticky top-0 z-30 h-14 flex items-center px-4 gap-3"
                style="background:var(--header-bg);border-bottom:1px solid var(--border);backdrop-filter:blur(12px)">

          <!-- Brand / back button -->
          <div class="flex items-center gap-2.5 cursor-pointer" (click)="goSearch()">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                 style="background:var(--primary);box-shadow:0 3px 10px hsl(152,69%,40%,0.35)">
              <span class="material-icons text-white" style="font-size:1rem">sports_volleyball</span>
            </div>
            <span class="font-heading font-bold text-sm" style="color:var(--foreground)">ArenaFlow</span>
          </div>

          <!-- Breadcrumb quando está numa arena -->
          <div *ngIf="view === 'arena' && selectedArena" class="flex items-center gap-1.5 min-w-0">
            <span class="material-icons" style="font-size:0.9rem;color:var(--muted-foreground)">chevron_right</span>
            <span class="text-xs font-medium truncate" style="color:var(--muted-foreground)">{{ selectedArena.name }}</span>
          </div>

          <div class="flex-1"></div>

          <!-- Dark mode toggle -->
          <button (click)="theme.toggle()"
                  class="w-9 h-9 rounded-xl flex items-center justify-center"
                  style="background:var(--muted);color:var(--muted-foreground)"
                  [title]="theme.dark() ? 'Modo claro' : 'Modo escuro'">
            <span *ngIf="!theme.dark()" class="material-icons" style="font-size:1.15rem">dark_mode</span>
            <span *ngIf="theme.dark()"  class="material-icons" style="font-size:1.15rem;color:var(--accent)">light_mode</span>
          </button>

          <!-- Avatar do usuário -->
          <div class="relative">
            <button (click)="menuOpen = !menuOpen"
                    class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style="border:2px solid var(--border)">
              <img *ngIf="auth.user()?.photoURL" [src]="auth.user()!.photoURL!" class="w-full h-full object-cover">
              <span *ngIf="!auth.user()?.photoURL" class="text-xs font-bold" style="color:var(--foreground)">
                {{ auth.user()?.displayName?.charAt(0) || '?' }}
              </span>
            </button>

            <!-- Dropdown -->
            <div *ngIf="menuOpen"
                 class="absolute right-0 top-11 rounded-xl py-1 z-50 min-w-[200px]"
                 style="background:var(--card);border:1px solid var(--border);box-shadow:0 8px 24px rgba(0,0,0,0.12)">
              <div class="px-4 py-2.5" style="border-bottom:1px solid var(--border)">
                <p class="text-sm font-semibold truncate" style="color:var(--foreground)">{{ auth.user()?.displayName }}</p>
                <p class="text-xs truncate" style="color:var(--muted-foreground)">{{ auth.user()?.email }}</p>
              </div>
              <button (click)="logout()"
                      class="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      style="color:#ef4444;background:none;border:none;cursor:pointer;text-align:left"
                      onmouseover="this.style.background='rgba(239,68,68,0.06)'"
                      onmouseout="this.style.background='none'">
                <span class="material-icons" style="font-size:1rem">logout</span>
                Sair
              </button>
            </div>
          </div>
        </header>

        <!-- Overlay para fechar menu -->
        <div *ngIf="menuOpen" class="fixed inset-0 z-20" (click)="menuOpen = false"></div>

        <!-- Views -->
        <app-search        *ngIf="view === 'search'"                (select)="openArena($event)"></app-search>
        <app-arena-detail  *ngIf="view === 'arena' && selectedArena"
                           [arena]="selectedArena" (back)="goSearch()"></app-arena-detail>
        <app-my-bookings   *ngIf="view === 'my-bookings'"></app-my-bookings>
        <app-user-profile  *ngIf="view === 'profile'"></app-user-profile>

        <!-- Bottom nav -->
        <nav class="fixed bottom-0 left-0 right-0 h-16 flex z-30"
             style="background:var(--card);border-top:1px solid var(--border);box-shadow:0 -4px 20px rgba(0,0,0,0.06)">
          <button class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                  [style.color]="view === 'search' || view === 'arena' ? 'var(--primary)' : 'var(--muted-foreground)'"
                  (click)="goSearch()">
            <span class="material-icons" style="font-size:1.3rem">search</span>
            <span style="font-size:0.6rem;font-weight:600">Explorar</span>
          </button>
          <button class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                  [style.color]="view === 'my-bookings' ? 'var(--primary)' : 'var(--muted-foreground)'"
                  (click)="view = 'my-bookings'">
            <span class="material-icons" style="font-size:1.3rem">event_note</span>
            <span style="font-size:0.6rem;font-weight:600">Reservas</span>
          </button>
          <button class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                  [style.color]="view === 'profile' ? 'var(--primary)' : 'var(--muted-foreground)'"
                  (click)="view = 'profile'">
            <span class="material-icons" style="font-size:1.3rem">person</span>
            <span style="font-size:0.6rem;font-weight:600">Perfil</span>
          </button>
        </nav>

        <!-- Toast -->
        <div *ngIf="toastMsg" class="toast" style="bottom:5rem">{{ toastMsg }}</div>
      </ng-container>
    </div>

    <style>
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── Volleyball loading overlay ── */
      .vb-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--background) 82%, transparent);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        animation: vb-fade-in 0.18s ease;
      }
      .vb-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.1rem;
      }
      .vb-ball-wrap {
        position: relative;
        width: clamp(4rem, 12vw, 6rem);
        height: clamp(4rem, 12vw, 6rem);
      }
      .vb-glow {
        position: absolute;
        inset: -0.6rem;
        border-radius: 50%;
        background: radial-gradient(circle, var(--primary), transparent 70%);
        animation: vb-glow-pulse 1.6s ease-in-out infinite;
      }
      .vb-ball {
        width: 100%;
        height: 100%;
        animation: vb-spin-open 2s ease-in-out infinite;
        position: relative;
        z-index: 1;
      }
      .vb-label {
        font-size: clamp(0.7rem, 2vw, 0.82rem);
        font-weight: 600;
        letter-spacing: 0.06em;
        color: var(--muted-foreground);
        text-transform: uppercase;
        margin: 0;
      }
      @keyframes vb-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes vb-glow-pulse {
        0%, 100% { transform: scale(1);   opacity: 0.18; }
        50%       { transform: scale(1.4); opacity: 0.06; }
      }
      @keyframes vb-spin-open {
        0%   { transform: rotate(0deg)   scale(1);    }
        25%  { transform: rotate(90deg)  scale(1.14); }
        50%  { transform: rotate(180deg) scale(1);    }
        75%  { transform: rotate(270deg) scale(1.14); }
        100% { transform: rotate(360deg) scale(1);    }
      }
    </style>
  `
})
export class AppComponent implements OnInit {
  view: View = 'search';
  selectedArena: Arena | null = null;
  toastMsg: string | null = null;
  menuOpen = false;

  showProfileCard = false;
  savingProfile   = false;
  profileForm     = { cpf: '', phone: '' };

  constructor(
    public theme: ThemeService,
    public auth: AuthService,
    public loading: LoadingService,
    private toast: ToastService,
    private userProfile: UserProfileService,
  ) {}

  ngOnInit() {
    this.toast.message$.subscribe(m => this.toastMsg = m);

    // Exibe card quando o perfil carrega incompleto (sem CPF ou sem celular)
    this.userProfile.profileLoaded$.subscribe(isIncomplete => {
      this.showProfileCard = isIncomplete;
    });
  }

  maskCpf(event: Event) {
    let v = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2');
    this.profileForm.cpf = (event.target as HTMLInputElement).value = v;
  }

  maskPhone(event: Event) {
    let v = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2');
    this.profileForm.phone = (event.target as HTMLInputElement).value = v;
  }

  saveProfileCard() {
    if (this.savingProfile) return;
    this.savingProfile = true;
    this.userProfile.saveProfile(this.profileForm).subscribe({
      next: () => {
        this.savingProfile    = false;
        this.showProfileCard  = false;
        this.toast.show('Perfil salvo com sucesso!');
      },
      error: () => {
        this.savingProfile = false;
        this.toast.show('Erro ao salvar. Tente novamente.');
      },
    });
  }

  skipProfileCard() {
    this.showProfileCard = false;
  }

  openArena(arena: Arena) {
    this.selectedArena = arena;
    this.view = 'arena';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goSearch() {
    this.view = 'search';
    this.selectedArena = null;
  }

  async logout() {
    this.menuOpen = false;
    await this.auth.logout();
  }
}
