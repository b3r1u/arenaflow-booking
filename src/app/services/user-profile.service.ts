import { Injectable } from '@angular/core';

export interface UserProfile {
  name: string;
  phone: string;
  photoUrl?: string;
}

const KEY = (uid: string) => `arenaflow_profile_${uid}`;

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  private uid: string | null = null;
  private data: UserProfile = { name: '', phone: '' };

  /** Chamado pelo AuthService ao confirmar o usuário logado */
  init(uid: string): void {
    this.uid = uid;
    try {
      const raw = localStorage.getItem(KEY(uid));
      this.data = raw ? JSON.parse(raw) : { name: '', phone: '' };
    } catch {
      this.data = { name: '', phone: '' };
    }
  }

  /** Chamado pelo AuthService no logout */
  clear(): void {
    this.uid = null;
    this.data = { name: '', phone: '' };
  }

  getProfile(): UserProfile {
    return { ...this.data };
  }

  update(updates: Partial<UserProfile>): void {
    if (!this.uid) return;
    this.data = { ...this.data, ...updates };
    localStorage.setItem(KEY(this.uid), JSON.stringify(this.data));
  }
}
