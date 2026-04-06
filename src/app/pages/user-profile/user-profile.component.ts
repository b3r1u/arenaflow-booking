import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .avatar-ring {
      background: linear-gradient(135deg, var(--primary), hsl(152,69%,28%));
    }
    .field-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem !important;
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .btn-danger {
      width: 100%;
      padding: 0.65rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: var(--font-heading, inherit);
      border: 1.5px solid hsl(0,84%,60%,0.3);
      background: transparent;
      color: hsl(0,84%,60%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.15s;
    }
    .btn-danger:hover { background: hsl(0,84%,60%,0.06); }
  `],
  template: `
    <div class="max-w-lg mx-auto px-4 pb-24 pt-4">

      <!-- Avatar -->
      <div class="text-center mb-6">
        <div class="relative inline-block">
          <div class="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center avatar-ring mx-auto">
            <img *ngIf="photoSrc" [src]="photoSrc" class="w-full h-full object-cover" alt="Foto de perfil">
            <span *ngIf="!photoSrc" class="font-heading font-bold text-3xl text-white">{{ initials }}</span>
          </div>
          <button (click)="fileInput.click()"
                  class="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style="background:var(--primary);color:white;border:2.5px solid var(--background)">
            <span class="material-icons" style="font-size:0.9rem">photo_camera</span>
          </button>
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onPhotoSelected($event)">
        </div>
        <h2 class="font-heading font-bold text-lg mt-3 leading-tight" style="color:var(--foreground)">
          {{ form.name || auth.user()?.displayName || 'Meu Perfil' }}
        </h2>
        <p class="text-xs mt-0.5" style="color:var(--muted-foreground)">{{ auth.user()?.email }}</p>
      </div>

      <!-- Form -->
      <div class="card p-5 space-y-4 mb-4">

        <!-- Info hint -->
        <div class="flex items-start gap-2 rounded-xl p-2.5" style="background:hsl(152,69%,40%,0.07)">
          <span class="material-icons flex-shrink-0" style="font-size:0.9rem;color:var(--primary);margin-top:1px">info</span>
          <p class="text-xs leading-relaxed" style="color:var(--primary)">
            Nome e telefone são usados para pré-preencher seus agendamentos automaticamente.
          </p>
        </div>

        <!-- Nome -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--foreground)">Nome completo</label>
          <div style="position:relative">
            <span class="material-icons field-icon">person</span>
            <input class="input" style="padding-left:2.25rem"
                   [(ngModel)]="form.name"
                   placeholder="Seu nome completo">
          </div>
        </div>

        <!-- Telefone -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--foreground)">Telefone (WhatsApp)</label>
          <div style="position:relative">
            <span class="material-icons field-icon">phone</span>
            <input class="input" style="padding-left:2.25rem"
                   [(ngModel)]="form.phone"
                   placeholder="(00) 00000-0000"
                   maxlength="15"
                   (input)="onPhoneInput($event)">
          </div>
        </div>

        <!-- E-mail (readonly) -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--foreground)">E-mail</label>
          <div style="position:relative">
            <span class="material-icons field-icon">mail_outline</span>
            <span class="material-icons" style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);font-size:0.9rem;color:var(--muted-foreground);pointer-events:none">lock</span>
            <input class="input" style="padding-left:2.25rem;padding-right:2.25rem;opacity:0.55;cursor:default"
                   [value]="auth.user()?.email || ''"
                   readonly>
          </div>
          <p class="text-xs mt-1" style="color:var(--muted-foreground)">O e-mail é gerenciado pela sua conta Google</p>
        </div>

      </div>

      <button class="btn-primary w-full py-3 mb-3" (click)="save()">
        <span class="material-icons" style="font-size:1rem">check</span>
        Salvar perfil
      </button>

      <button class="btn-danger" (click)="logout()">
        <span class="material-icons" style="font-size:1rem">logout</span>
        Sair da conta
      </button>

    </div>
  `
})
export class UserProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form = { name: '', phone: '' };
  photoSrc: string | null = null;

  constructor(
    public auth: AuthService,
    private profileService: UserProfileService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const p = this.profileService.getProfile();
    this.form.name  = p.name  || this.auth.user()?.displayName || '';
    this.form.phone = p.phone || '';
    this.photoSrc   = p.photoUrl || this.auth.user()?.photoURL || null;
  }

  get initials(): string {
    const name = this.form.name || this.auth.user()?.displayName || '?';
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
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
    this.form.phone = m;
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('Imagem muito grande. Máximo 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoSrc = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  save() {
    this.profileService.update({
      name:     this.form.name.trim(),
      phone:    this.form.phone,
      photoUrl: this.photoSrc ?? undefined,
    });
    this.toast.show('Perfil salvo com sucesso!');
  }

  async logout() {
    await this.auth.logout();
  }
}
