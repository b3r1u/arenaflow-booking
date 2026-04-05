import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './pages/search/search.component';
import { ArenaDetailComponent } from './pages/arena-detail/arena-detail.component';
import { MyBookingsComponent } from './pages/booking/booking.component';
import { LoginComponent } from './pages/login/login.component';
import { ToastService } from './services/toast.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { Arena } from './models/models';

type View = 'search' | 'arena' | 'my-bookings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, ArenaDetailComponent, MyBookingsComponent, LoginComponent],
  template: `
    <div style="background-color:var(--background);min-height:100vh">

      <!-- Loading auth state -->
      <div *ngIf="auth.loading()" class="min-h-screen flex items-center justify-center"
           style="background:var(--background)">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
               style="background:var(--primary)">
            <span class="material-icons text-white" style="font-size:1.5rem">sports_volleyball</span>
          </div>
          <span class="material-icons" style="font-size:1.5rem;color:var(--muted-foreground);animation:spin 1s linear infinite">refresh</span>
        </div>
      </div>

      <!-- Not logged in -->
      <app-login *ngIf="!auth.loading() && !auth.user()"></app-login>

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
        <app-search       *ngIf="view === 'search'"     (select)="openArena($event)"></app-search>
        <app-arena-detail *ngIf="view === 'arena' && selectedArena"
                          [arena]="selectedArena" (back)="goSearch()"></app-arena-detail>
        <app-my-bookings  *ngIf="view === 'my-bookings'"></app-my-bookings>

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
            <span style="font-size:0.6rem;font-weight:600">Minhas reservas</span>
          </button>
        </nav>

        <!-- Toast -->
        <div *ngIf="toastMsg" class="toast" style="bottom:5rem">{{ toastMsg }}</div>
      </ng-container>
    </div>

    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class AppComponent implements OnInit {
  view: View = 'search';
  selectedArena: Arena | null = null;
  toastMsg: string | null = null;
  menuOpen = false;

  constructor(
    public theme: ThemeService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.toast.message$.subscribe(m => this.toastMsg = m);
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
