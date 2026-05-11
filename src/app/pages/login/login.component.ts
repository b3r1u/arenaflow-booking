import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'register' | 'reset';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .login-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      background: #050e09;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.6;
      pointer-events: none;
    }
    .blob-1 {
      width: 480px; height: 480px;
      background: radial-gradient(circle, #1a7a3f, #0a2e18);
      top: -180px; left: -180px;
      animation: float1 11s ease-in-out infinite;
    }
    .blob-2 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, #16a34a, #0d3d1e);
      bottom: -140px; right: -140px;
      animation: float2 14s ease-in-out infinite;
    }
    .blob-3 {
      width: 280px; height: 280px;
      background: radial-gradient(circle, #86efac, #22c55e);
      top: 50%; left: 60%;
      opacity: 0.18;
      animation: float3 8s ease-in-out infinite;
    }

    @keyframes float1 {
      0%, 100% { transform: translate(0,0) scale(1); }
      50%       { transform: translate(70px, 55px) scale(1.1); }
    }
    @keyframes float2 {
      0%, 100% { transform: translate(0,0) scale(1); }
      50%       { transform: translate(-55px, -65px) scale(1.08); }
    }
    @keyframes float3 {
      0%, 100% { transform: translate(0,0) scale(1); }
      33%       { transform: translate(-35px, 25px) scale(1.06); }
      66%       { transform: translate(25px, -35px) scale(0.94); }
    }

    .glass-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 390px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1.75rem;
      padding: 2rem 1.75rem;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5);
      animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes cardIn {
      from { opacity:0; transform:translateY(28px) scale(0.98); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }

    .tab-bar {
      display: flex;
      border-radius: 0.75rem;
      padding: 0.25rem;
      background: rgba(255,255,255,0.07);
      margin-bottom: 1.25rem;
    }
    .tab-btn {
      flex: 1;
      padding: 0.4rem 0;
      border-radius: 0.55rem;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      color: rgba(255,255,255,0.45);
      background: transparent;
    }
    .tab-btn.active {
      background: rgba(255,255,255,0.13);
      color: #fff;
      box-shadow: 0 1px 6px rgba(0,0,0,0.25);
    }

    .glass-input {
      width: 100%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.75rem;
      padding: 0.7rem 0.9rem 0.7rem 2.4rem;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
    }
    .glass-input::placeholder { color: rgba(255,255,255,0.3); }
    .glass-input:focus {
      border-color: #22a55c;
      background: rgba(255,255,255,0.09);
    }

    .input-wrap { position: relative; margin-bottom: 0.75rem; }
    .input-icon {
      position: absolute;
      left: 0.75rem; top: 50%; transform: translateY(-50%);
      font-size: 1rem; color: rgba(255,255,255,0.35);
      pointer-events: none;
    }
    .eye-btn {
      position: absolute;
      right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.35); padding: 0; display: flex;
    }

    .btn-primary {
      width: 100%;
      padding: 0.72rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #22a55c, #16a34a);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      margin-top: 0.9rem;
      box-shadow: 0 4px 16px rgba(34,165,92,0.35);
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .divider { display:flex; align-items:center; gap:0.75rem; margin:1rem 0; }
    .divider-line { flex:1; height:1px; background:rgba(255,255,255,0.1); }
    .divider-text { font-size:0.75rem; color:rgba(255,255,255,0.3); }

    .btn-google {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      padding: 0.65rem;
      border-radius: 0.75rem;
      background: rgba(255,255,255,0.92);
      color: #3c4043;
      font-weight: 600;
      font-size: 0.875rem;
      border: none; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-google:hover:not(:disabled) { background: #fff; transform: translateY(-1px); }
    .btn-google:disabled { opacity: 0.55; cursor: not-allowed; }

    .forgot-btn {
      background: none; border: none; cursor: pointer;
      color: #4ade80; font-size: 0.75rem; padding: 0;
    }
    .back-btn {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.45); font-size: 0.875rem;
      padding: 0; display: flex; align-items: center; gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modal legal ── */
    .legal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(4px);
      display: flex; align-items: flex-end; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    @media (min-height: 600px) { .legal-overlay { align-items: center; } }
    .legal-modal {
      background: #0d1f14;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1.25rem 1.25rem 0 0;
      width: 100%; max-width: 560px;
      max-height: 82vh;
      display: flex; flex-direction: column;
      padding: 1.25rem 1.25rem 2rem;
      animation: slideUp 0.25s ease;
      overflow: hidden;
    }
    @media (min-height: 600px) {
      .legal-modal { border-radius: 1.25rem; max-height: 78vh; }
    }
    .legal-tab {
      flex: 1; background: none; border: none; cursor: pointer;
      padding: 0.6rem 0; font-size: 0.8rem; font-weight: 600;
      color: rgba(255,255,255,0.35);
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .legal-tab.active { color: #4ade80; border-bottom-color: #4ade80; }
    .legal-body {
      overflow-y: auto; flex: 1;
      padding-right: 0.25rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    .legal-body h2 {
      font-size: 1rem; font-weight: 700; color: #fff;
      margin: 0.5rem 0 0.25rem;
    }
    .legal-body h3 {
      font-size: 0.78rem; font-weight: 700;
      color: #4ade80; margin: 1rem 0 0.3rem;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .legal-body p, .legal-body li {
      font-size: 0.78rem; color: rgba(255,255,255,0.58);
      line-height: 1.6; margin: 0 0 0.4rem;
    }
    .legal-body ul { padding-left: 1.1rem; margin: 0.3rem 0 0.6rem; }
    .legal-updated { font-size: 0.7rem !important; color: rgba(255,255,255,0.28) !important; }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
  template: `
    <div class="login-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div class="glass-card">

        <!-- Logo -->
        <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:1.75rem">
          <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem">
            <svg width="44" height="44" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2.5" cy="10" r="1.8" fill="#22c55e"/>
              <path d="M2.5,6.5 L8,6.5 L8,13.5 L2.5,13.5" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.38"/>
              <path d="M2.5,4 L13,4 L13,16 L2.5,16" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>
              <path d="M2.5,1.5 L18,1.5 L18,18.5 L2.5,18.5" fill="none" stroke="#22c55e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.35rem;color:#fff;line-height:1.1">Arena</div>
              <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.35rem;color:#22c55e;line-height:1.1;letter-spacing:0.18em">FLOW</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin:0.2rem 0 0;text-align:center">Reserve sua quadra de forma rápida e fácil</p>
        </div>

        <!-- Tabs -->
        <div *ngIf="mode !== 'reset'" class="tab-bar">
          <button class="tab-btn" [class.active]="mode === 'login'"    (click)="setMode('login')">Entrar</button>
          <button class="tab-btn" [class.active]="mode === 'register'" (click)="setMode('register')">Cadastrar</button>
        </div>

        <!-- Reset header -->
        <div *ngIf="mode === 'reset'" style="margin-bottom:1.25rem">
          <button class="back-btn" (click)="setMode('login')">
            <span class="material-icons" style="font-size:1rem">arrow_back</span> Voltar
          </button>
          <p style="font-family:'Space Grotesk',sans-serif;font-weight:600;color:#fff;margin:0">Redefinir senha</p>
          <p style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin:0.2rem 0 0">Enviaremos um link para o seu e-mail</p>
        </div>

        <!-- Campos -->
        <div *ngIf="mode === 'register'" class="input-wrap">
          <span class="material-icons input-icon">person</span>
          <input class="glass-input" [(ngModel)]="name" type="text" placeholder="Seu nome completo" autocomplete="name">
        </div>

        <div class="input-wrap">
          <span class="material-icons input-icon">mail</span>
          <input class="glass-input" [(ngModel)]="email" type="email" placeholder="E-mail" autocomplete="email">
        </div>

        <div *ngIf="mode !== 'reset'" class="input-wrap" style="margin-bottom:0.25rem">
          <span class="material-icons input-icon">lock</span>
          <input class="glass-input" style="padding-right:2.75rem"
                 [(ngModel)]="password"
                 [type]="showPass ? 'text' : 'password'"
                 [placeholder]="mode === 'register' ? 'Senha (mín. 6 caracteres)' : 'Senha'"
                 autocomplete="current-password">
          <button class="eye-btn" type="button" (click)="showPass = !showPass">
            <span class="material-icons" style="font-size:1rem">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
          </button>
        </div>

        <div *ngIf="mode === 'login'" style="text-align:right;margin-bottom:0.25rem">
          <button class="forgot-btn" (click)="setMode('reset')">Esqueci minha senha</button>
        </div>

        <p *ngIf="error"   style="font-size:0.78rem;color:#f87171;margin:0.5rem 0 0">{{ error }}</p>
        <p *ngIf="success" style="font-size:0.78rem;color:#4ade80;margin:0.5rem 0 0">{{ success }}</p>

        <button class="btn-primary" (click)="submit()" [disabled]="loading">
          <svg *ngIf="loading" style="width:0.9rem;height:0.9rem;flex-shrink:0" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.25)" stroke-width="9"/>
            <circle cx="50" cy="50" r="36" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="169.6 226.2" style="transform-origin:50px 50px;animation:sp-cw 0.9s cubic-bezier(0.4,0,0.2,1) infinite"/>
          </svg>
          {{ loading ? 'Aguarde...' : submitLabel }}
        </button>

        <ng-container *ngIf="mode !== 'reset'">
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">ou</span>
            <div class="divider-line"></div>
          </div>
          <button class="btn-google" (click)="loginWithGoogle()" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6c1.8-5.4 6.9-9.8 13.6-9.8z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.6 0-12.2-4.4-14.2-10.4l-7.8 6C6.6 42.6 14.6 48 24 48z"/>
            </svg>
            Continuar com Google
          </button>
        </ng-container>

        <p style="font-size:0.7rem;text-align:center;color:rgba(255,255,255,0.22);margin-top:1.25rem;margin-bottom:0">
          Ao entrar, você concorda com os
          <button (click)="openLegal('terms')" style="background:none;border:none;padding:0;color:rgba(255,255,255,0.45);font-size:0.7rem;cursor:pointer;text-decoration:underline">Termos de Uso</button>
          e a
          <button (click)="openLegal('privacy')" style="background:none;border:none;padding:0;color:rgba(255,255,255,0.45);font-size:0.7rem;cursor:pointer;text-decoration:underline">Política de Privacidade</button>
        </p>
      </div>
    </div>

    <!-- Modal: Termos / Privacidade -->
    <div *ngIf="legalOpen" class="legal-overlay" (click)="legalOpen=false">
      <div class="legal-modal" (click)="$event.stopPropagation()">
        <!-- Tabs -->
        <div style="display:flex;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:1.25rem">
          <button class="legal-tab" [class.active]="legalTab==='terms'"   (click)="legalTab='terms'">Termos de Uso</button>
          <button class="legal-tab" [class.active]="legalTab==='privacy'" (click)="legalTab='privacy'">Política de Privacidade</button>
          <button (click)="legalOpen=false" style="margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);font-size:1.25rem;padding:0 0.25rem;line-height:1">×</button>
        </div>

        <!-- Termos de Uso -->
        <div *ngIf="legalTab==='terms'" class="legal-body">
          <h2>Termos de Uso — ArenaFlow</h2>
          <p class="legal-updated">Última atualização: maio de 2025</p>

          <h3>1. Aceitação</h3>
          <p>Ao acessar ou utilizar o aplicativo ArenaFlow, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso. Caso não concorde, interrompa o uso imediatamente.</p>

          <h3>2. O Serviço</h3>
          <p>O ArenaFlow é uma plataforma de intermediação que conecta usuários a estabelecimentos esportivos (arenas) para reserva de quadras. Não somos proprietários nem operadores das arenas cadastradas.</p>

          <h3>3. Cadastro e Conta</h3>
          <p>Para utilizar o serviço é necessário criar uma conta com informações verídicas. Você é responsável pela confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.</p>

          <h3>4. Reservas e Pagamentos</h3>
          <p>As reservas são confirmadas somente após o pagamento via PIX. O valor é processado pelo Pagar.me (gateway de pagamento certificado pelo Banco Central). Uma taxa de serviço pode ser aplicada conforme o plano do estabelecimento.</p>

          <h3>5. Cancelamentos</h3>
          <p>As políticas de cancelamento e reembolso são definidas por cada estabelecimento. Verifique as condições antes de confirmar sua reserva. Estornos para pagamentos via PIX podem levar até 5 dias úteis.</p>

          <h3>6. Responsabilidades</h3>
          <p>O ArenaFlow não se responsabiliza por: (a) problemas decorrentes do estabelecimento, como fechamento inesperado ou manutenção; (b) danos ou lesões ocorridos nas dependências da arena; (c) falhas de conectividade à internet.</p>

          <h3>7. Propriedade Intelectual</h3>
          <p>Todo o conteúdo da plataforma (marca, design, código) é propriedade da ArenaFlow / Solve Tecnologia. É proibida a reprodução sem autorização prévia.</p>

          <h3>8. Alterações</h3>
          <p>Podemos atualizar estes Termos a qualquer momento. Notificaremos por e-mail ou pelo próprio aplicativo sobre mudanças relevantes.</p>

          <h3>9. Contato</h3>
          <p>Dúvidas: <strong>connectsolve.ti&#64;gmail.com</strong></p>
        </div>

        <!-- Política de Privacidade -->
        <div *ngIf="legalTab==='privacy'" class="legal-body">
          <h2>Política de Privacidade — ArenaFlow</h2>
          <p class="legal-updated">Última atualização: maio de 2025 · Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

          <h3>1. Controlador dos Dados</h3>
          <p>Solve Tecnologia ("ArenaFlow") é a controladora dos seus dados pessoais. Contato do responsável pela proteção de dados: <strong>connectsolve.ti&#64;gmail.com</strong></p>

          <h3>2. Dados Coletados</h3>
          <p><strong>Dados fornecidos por você:</strong> nome completo, e-mail, CPF, telefone celular.<br>
          <strong>Dados gerados pelo uso:</strong> histórico de reservas, horários, quadras preferidas, avaliações.<br>
          <strong>Dados de pagamento:</strong> processados diretamente pelo Pagar.me — não armazenamos número de cartão ou chaves PIX completas.</p>

          <h3>3. Finalidade e Base Legal</h3>
          <p><strong>Execução do contrato (Art. 7º, V, LGPD):</strong> criação de conta, processamento de reservas e pagamentos.<br>
          <strong>Legítimo interesse (Art. 7º, IX, LGPD):</strong> comunicação sobre reservas, envio de confirmações por e-mail.<br>
          <strong>Consentimento (Art. 7º, I, LGPD):</strong> envio de comunicações promocionais (quando aplicável).</p>

          <h3>4. Compartilhamento de Dados</h3>
          <p>Seus dados são compartilhados apenas com:</p>
          <ul>
            <li><strong>Firebase / Google:</strong> autenticação e armazenamento seguro de credenciais.</li>
            <li><strong>Pagar.me:</strong> processamento de pagamentos PIX (certificado pelo Banco Central).</li>
            <li><strong>Resend:</strong> envio de e-mails transacionais (confirmações de reserva).</li>
            <li><strong>Estabelecimento reservado:</strong> nome e telefone para confirmar o atendimento.</li>
          </ul>
          <p>Não vendemos, alugamos ou cedemos seus dados a terceiros para fins comerciais.</p>

          <h3>5. Retenção de Dados</h3>
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados são removidos em até 30 dias, exceto quando houver obrigação legal de retenção.</p>

          <h3>6. Seus Direitos (LGPD)</h3>
          <p>Você tem direito a: confirmar a existência de tratamento · acessar seus dados · corrigir dados incompletos · solicitar anonimização ou exclusão · revogar consentimento · portabilidade dos dados.</p>
          <p>Para exercer esses direitos, envie sua solicitação para <strong>connectsolve.ti&#64;gmail.com</strong> com o assunto "LGPD – [seu pedido]".</p>

          <h3>7. Segurança</h3>
          <p>Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia em trânsito (HTTPS/TLS), dados financeiros sensíveis armazenados de forma criptografada, acesso restrito por autenticação.</p>

          <h3>8. Cookies</h3>
          <p>Utilizamos apenas cookies essenciais para o funcionamento do aplicativo. Não utilizamos cookies de rastreamento ou publicidade.</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  mode: Mode = 'login';
  legalOpen = false;
  legalTab: 'terms' | 'privacy' = 'terms';
  name = '';
  email = '';
  password = '';
  showPass = false;
  loading = false;
  error = '';
  success = '';

  constructor(private auth: AuthService) {}

  get submitLabel() {
    if (this.mode === 'login')    return 'Entrar';
    if (this.mode === 'register') return 'Criar conta';
    return 'Enviar link de redefinição';
  }

  openLegal(tab: 'terms' | 'privacy') { this.legalTab = tab; this.legalOpen = true; }

  setMode(m: Mode) { this.mode = m; this.error = ''; this.success = ''; }

  async submit() {
    this.error = ''; this.success = ''; this.loading = true;
    try {
      if (this.mode === 'login')         await this.auth.loginWithEmail(this.email, this.password);
      else if (this.mode === 'register') await this.auth.registerWithEmail(this.name, this.email, this.password);
      else { await this.auth.resetPassword(this.email); this.success = 'Link enviado! Verifique sua caixa de entrada.'; }
    } catch (e: any) {
      this.error = this.friendlyError(e.code);
    } finally { this.loading = false; }
  }

  async loginWithGoogle() {
    this.loading = true; this.error = '';
    try { await this.auth.loginWithGoogle(); }
    catch (e: any) {
      console.error('[Google Auth]', e?.code, e?.message);
      if (e?.code === 'auth/unauthorized-domain') {
        this.error = 'Domínio não autorizado no Firebase. Adicione este domínio nas configurações do projeto.';
      } else {
        this.error = 'Não foi possível entrar com Google. Tente novamente.';
      }
      this.loading = false;
    }
  }

  private friendlyError(code: string): string {
    const map: Record<string,string> = {
      'auth/invalid-email':        'E-mail inválido.',
      'auth/user-not-found':       'Nenhuma conta encontrada com este e-mail.',
      'auth/wrong-password':       'Senha incorreta.',
      'auth/invalid-credential':   'E-mail ou senha incorretos.',
      'auth/email-already-in-use': 'Este e-mail já está em uso.',
      'auth/weak-password':        'A senha deve ter pelo menos 6 caracteres.',
      'auth/too-many-requests':    'Muitas tentativas. Tente novamente mais tarde.',
    };
    return map[code] ?? 'Ocorreu um erro. Tente novamente.';
  }
}
