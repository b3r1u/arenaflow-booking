import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  name:     string;
  phone:    string;
  cpf:      string;
  photoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  private _profile: UserProfile = { name: '', phone: '', cpf: '' };

  /** Emite true quando o perfil está incompleto, false quando completo */
  readonly profileLoaded$ = new Subject<boolean>();

  constructor(private api: ApiService) {}

  /** Carrega perfil da API após login */
  loadFromApi() {
    return this.api.get<{ user: any }>('/users/me').pipe(
      tap({ next: ({ user }) => {
        this._profile = {
          name:  user.name  || '',
          phone: user.phone || '',
          cpf:   user.cpf   || '',
        };
        this.profileLoaded$.next(this.isIncomplete());
      }})
    );
  }

  /** Chamado pelo AuthService no logout */
  clear(): void {
    this._profile = { name: '', phone: '', cpf: '' };
  }

  getProfile(): UserProfile {
    return { ...this._profile };
  }

  /** Verifica se o perfil está incompleto (sem CPF ou sem celular) */
  isIncomplete(): boolean {
    return !this._profile.cpf || !this._profile.phone;
  }

  /** Salva CPF e phone na API */
  saveProfile(updates: Partial<UserProfile>) {
    return this.api.put<{ user: any }>('/users/me', updates).pipe(
      tap({ next: ({ user }) => {
        this._profile = {
          name:  user.name  || '',
          phone: user.phone || '',
          cpf:   user.cpf   || '',
        };
      }})
    );
  }
}
