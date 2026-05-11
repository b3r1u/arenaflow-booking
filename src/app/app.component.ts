import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from './pages/search/search.component';
import { ArenaDetailComponent } from './pages/arena-detail/arena-detail.component';
import { MyBookingsComponent } from './pages/booking/booking.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { PublicBookingComponent } from './pages/public-booking/public-booking.component';
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
  imports: [CommonModule, FormsModule, SearchComponent, ArenaDetailComponent, MyBookingsComponent, UserProfileComponent, LoginComponent, PublicBookingComponent],
  template: `
    <div style="background-color:var(--background);min-height:100vh">

      <!-- Página pública de reserva — sem autenticação -->
      <app-public-booking *ngIf="publicBookingId" [bookingId]="publicBookingId"></app-public-booking>

      <ng-container *ngIf="!publicBookingId">

      <!-- Loading auth state -->
      <div *ngIf="auth.loading()" class="min-h-screen flex items-center justify-center"
           style="background:var(--background)">
        <svg style="width:clamp(4rem,12vw,5.5rem);height:clamp(4rem,12vw,5.5rem)" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="36" stroke="var(--primary)" stroke-width="3" opacity="0.1"/>
          <circle cx="50" cy="50" r="36" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-dasharray="169.6 226.2" style="transform-origin:50px 50px;animation:sp-cw 1.3s cubic-bezier(0.4,0,0.2,1) infinite"/>
          <circle cx="50" cy="50" r="22" stroke="var(--primary)" stroke-width="2.5" opacity="0.1"/>
          <circle cx="50" cy="50" r="22" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="69.1 138.2" opacity="0.65" style="transform-origin:50px 50px;animation:sp-ccw 0.9s cubic-bezier(0.4,0,0.2,1) infinite"/>
          <circle cx="50" cy="50" r="5" fill="var(--primary)" style="animation:sp-pulse 1.3s ease-in-out infinite"/>
        </svg>
      </div>

      <!-- HTTP loading overlay -->
      <div *ngIf="loading.isLoading()" class="sp-overlay">
        <svg style="width:clamp(4rem,12vw,5.5rem);height:clamp(4rem,12vw,5.5rem)" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="36" stroke="var(--primary)" stroke-width="3" opacity="0.1"/>
          <circle cx="50" cy="50" r="36" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-dasharray="169.6 226.2" style="transform-origin:50px 50px;animation:sp-cw 1.3s cubic-bezier(0.4,0,0.2,1) infinite"/>
          <circle cx="50" cy="50" r="22" stroke="var(--primary)" stroke-width="2.5" opacity="0.1"/>
          <circle cx="50" cy="50" r="22" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="69.1 138.2" opacity="0.65" style="transform-origin:50px 50px;animation:sp-ccw 0.9s cubic-bezier(0.4,0,0.2,1) infinite"/>
          <circle cx="50" cy="50" r="5" fill="var(--primary)" style="animation:sp-pulse 1.3s ease-in-out infinite"/>
        </svg>
      </div>

      <!-- Not logged in -->
      <app-login *ngIf="!auth.loading() && !auth.user()"></app-login>

      <!-- Card de boas-vindas: pede CPF e celular na primeira vez -->
      <div *ngIf="!auth.loading() && auth.user() && showProfileCard"
           class="sp-overlay" style="z-index:500">
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
        </div>
      </div>

      <!-- Logged in -->
      <ng-container *ngIf="!auth.loading() && auth.user()">

        <!-- Header -->
        <header class="sticky top-0 z-30 h-14 flex items-center px-4 gap-3"
                style="background:var(--header-bg);border-bottom:1px solid var(--border);backdrop-filter:blur(12px)">

          <!-- Brand / back button -->
          <div class="flex items-center gap-2.5 cursor-pointer" (click)="goSearch()">
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2.5" cy="10" r="1.8" fill="#22c55e"/>
              <path d="M2.5,6.5 L8,6.5 L8,13.5 L2.5,13.5" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.38"/>
              <path d="M2.5,4 L13,4 L13,16 L2.5,16" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>
              <path d="M2.5,1.5 L18,1.5 L18,18.5 L2.5,18.5" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:0.85rem;color:var(--foreground);line-height:1.1">Arena</div>
              <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:0.85rem;color:#22c55e;line-height:1.1;letter-spacing:0.18em">FLOW</div>
            </div>
          </div>

          <!-- Breadcrumb quando está numa arena -->
          <div *ngIf="view === 'arena' && selectedArena" class="flex items-center gap-1.5 min-w-0">
            <span class="material-icons" style="font-size:0.9rem;color:var(--muted-foreground)">chevron_right</span>
            <span class="text-xs font-medium truncate" style="color:var(--muted-foreground)">{{ selectedArena.name }}</span>
          </div>

          <div class="flex-1"></div>

          <!-- Avatar do usuário -->
          <div class="relative">
            <button (click)="menuOpen = !menuOpen"
                    class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style="border:2px solid var(--border)">
              <img *ngIf="auth.user()?.photoURL && !avatarError"
                   [src]="auth.user()!.photoURL!"
                   class="w-full h-full object-cover"
                   (error)="avatarError = true">
              <span *ngIf="!auth.user()?.photoURL || avatarError" class="text-xs font-bold" style="color:var(--foreground)">
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
              <button (click)="legalOpen=true;legalTab='terms';menuOpen=false"
                      class="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      style="color:var(--muted-foreground);background:none;border:none;cursor:pointer;text-align:left"
                      onmouseover="this.style.background='var(--muted)'"
                      onmouseout="this.style.background='none'">
                <span class="material-icons" style="font-size:1rem">gavel</span>
                Termos e Privacidade
              </button>
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

        <!-- Modal: Termos / Privacidade -->
        <div *ngIf="legalOpen" class="legal-overlay" (click)="legalOpen=false">
          <div class="legal-modal" (click)="$event.stopPropagation()">
            <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:1.25rem">
              <button class="legal-tab" [class.active]="legalTab==='terms'"   (click)="legalTab='terms'">Termos de Uso</button>
              <button class="legal-tab" [class.active]="legalTab==='privacy'" (click)="legalTab='privacy'">Política de Privacidade</button>
              <button (click)="legalOpen=false" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--muted-foreground);font-size:1.4rem;padding:0 0.25rem;line-height:1">×</button>
            </div>
            <div *ngIf="legalTab==='terms'" class="legal-body">
              <h2>Termos de Uso — ArenaFlow</h2>
              <p class="legal-updated">Última atualização: maio de 2025</p>
              <h3>1. Aceitação</h3>
              <p>Ao acessar ou utilizar o aplicativo ArenaFlow, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.</p>
              <h3>2. O Serviço</h3>
              <p>O ArenaFlow é uma plataforma de intermediação que conecta usuários a estabelecimentos esportivos para reserva de quadras. Não somos proprietários nem operadores das arenas cadastradas.</p>
              <h3>3. Cadastro e Conta</h3>
              <p>Para utilizar o serviço é necessário criar uma conta com informações verídicas. Você é responsável pela confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.</p>
              <h3>4. Reservas e Pagamentos</h3>
              <p>As reservas são confirmadas somente após o pagamento via PIX. O valor é processado pelo Pagar.me (gateway certificado pelo Banco Central). Uma taxa de serviço pode ser aplicada conforme o plano do estabelecimento.</p>
              <h3>5. Cancelamentos</h3>
              <p>As políticas de cancelamento e reembolso são definidas por cada estabelecimento. Estornos via PIX podem levar até 5 dias úteis.</p>
              <h3>6. Responsabilidades</h3>
              <p>O ArenaFlow não se responsabiliza por problemas decorrentes do estabelecimento, danos ocorridos nas dependências da arena ou falhas de conectividade.</p>
              <h3>7. Alterações</h3>
              <p>Podemos atualizar estes Termos a qualquer momento. Notificaremos por e-mail sobre mudanças relevantes.</p>
              <h3>8. Contato</h3>
              <p>Dúvidas: <strong>connectsolve.ti&#64;gmail.com</strong></p>
            </div>
            <div *ngIf="legalTab==='privacy'" class="legal-body">
              <h2>Política de Privacidade — ArenaFlow</h2>
              <p class="legal-updated">Última atualização: maio de 2025 · Conforme LGPD (Lei nº 13.709/2018)</p>
              <h3>1. Controlador dos Dados</h3>
              <p>Solve Tecnologia ("ArenaFlow") é a controladora dos seus dados. Contato: <strong>connectsolve.ti&#64;gmail.com</strong></p>
              <h3>2. Dados Coletados</h3>
              <p><strong>Fornecidos por você:</strong> nome, e-mail, CPF, telefone.<br><strong>Gerados pelo uso:</strong> histórico de reservas, avaliações.<br><strong>Pagamento:</strong> processados pelo Pagar.me — não armazenamos dados de cartão.</p>
              <h3>3. Finalidade e Base Legal</h3>
              <p><strong>Execução do contrato (Art. 7º, V):</strong> criação de conta, reservas e pagamentos.<br><strong>Legítimo interesse (Art. 7º, IX):</strong> confirmações por e-mail.</p>
              <h3>4. Compartilhamento</h3>
              <p>Compartilhamos dados apenas com: Firebase/Google (autenticação), Pagar.me (pagamentos), Resend (e-mails), e o estabelecimento reservado (nome e telefone). Não vendemos seus dados.</p>
              <h3>5. Retenção</h3>
              <p>Dados mantidos enquanto a conta estiver ativa. Após exclusão, removidos em até 30 dias salvo obrigação legal.</p>
              <h3>6. Seus Direitos (LGPD)</h3>
              <p>Acesso, correção, exclusão, portabilidade e revogação de consentimento. Solicite em: <strong>connectsolve.ti&#64;gmail.com</strong> com assunto "LGPD – [pedido]".</p>
              <h3>7. Segurança</h3>
              <p>Criptografia em trânsito (HTTPS/TLS), dados financeiros criptografados, acesso restrito por autenticação.</p>
            </div>
          </div>
        </div>
      </ng-container>

      </ng-container> <!-- /!publicBookingId -->
    </div>

    <style>
      /* ── Modal legal ── */
      .legal-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(4px);
        display: flex; align-items: flex-end; justify-content: center;
        animation: sp-fade 0.2s ease;
      }
      @media (min-height: 600px) { .legal-overlay { align-items: center; } }
      .legal-modal {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 1.25rem 1.25rem 0 0;
        width: 100%; max-width: 560px;
        max-height: 80vh;
        display: flex; flex-direction: column;
        padding: 1.25rem 1.25rem 2rem;
        overflow: hidden;
      }
      @media (min-height: 600px) {
        .legal-modal { border-radius: 1.25rem; max-height: 75vh; }
      }
      .legal-tab {
        flex: 1; background: none; border: none; cursor: pointer;
        padding: 0.6rem 0; font-size: 0.8rem; font-weight: 600;
        color: var(--muted-foreground);
        border-bottom: 2px solid transparent;
        transition: color 0.2s, border-color 0.2s;
      }
      .legal-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
      .legal-body {
        overflow-y: auto; flex: 1; padding-right: 0.25rem;
        scrollbar-width: thin;
        scrollbar-color: var(--border) transparent;
      }
      .legal-body h2 {
        font-size: 1rem; font-weight: 700; color: var(--foreground);
        margin: 0.5rem 0 0.25rem;
      }
      .legal-body h3 {
        font-size: 0.72rem; font-weight: 700; color: var(--primary);
        margin: 1rem 0 0.3rem; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .legal-body p, .legal-body li {
        font-size: 0.78rem; color: var(--muted-foreground);
        line-height: 1.65; margin: 0 0 0.4rem;
      }
      .legal-body ul { padding-left: 1.1rem; margin: 0.3rem 0 0.6rem; }
      .legal-updated { font-size: 0.68rem !important; color: var(--border) !important; }

      /* ── HTTP loading overlay ── */
      .sp-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        background: color-mix(in srgb, var(--background) 82%, transparent);
        backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
        animation: sp-fade 0.18s ease;
      }
      @keyframes sp-fade { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `
})
export class AppComponent implements OnInit {
  view: View = 'search';
  selectedArena: Arena | null = null;
  toastMsg: string | null = null;
  menuOpen    = false;
  avatarError = false;
  legalOpen   = false;
  legalTab: 'terms' | 'privacy' = 'terms';

  showProfileCard = false;
  savingProfile   = false;
  profileForm     = { cpf: '', phone: '' };

  /** ID da reserva quando a URL é /reserva/:id (página pública) */
  publicBookingId: string | null = null;

  constructor(
    public theme: ThemeService,
    public auth: AuthService,
    public loading: LoadingService,
    private toast: ToastService,
    private userProfile: UserProfileService,
  ) {}

  ngOnInit() {
    // Detecta /reserva/:id — página pública sem autenticação
    const match = window.location.pathname.match(/^\/reserva\/([^/]+)/);
    if (match) {
      this.publicBookingId = match[1];
      return; // não inicializa o resto do app
    }

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
