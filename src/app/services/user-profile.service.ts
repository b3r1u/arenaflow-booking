import { Injectable } from '@angular/core';

export interface UserProfile {
  name: string;
  phone: string;
  photoUrl?: string;
}

const KEY = 'arenaflow_user_profile';

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  private data: UserProfile = this.load();

  private load(): UserProfile {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { name: '', phone: '' };
    } catch {
      return { name: '', phone: '' };
    }
  }

  getProfile(): UserProfile {
    return { ...this.data };
  }

  update(updates: Partial<UserProfile>): void {
    this.data = { ...this.data, ...updates };
    localStorage.setItem(KEY, JSON.stringify(this.data));
  }
}
