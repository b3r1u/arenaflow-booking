import { Injectable, signal } from '@angular/core';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { firebaseAuth } from '../firebase.config';
import { UserProfileService } from './user-profile.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  loading = signal(true);

  constructor(private profileService: UserProfileService, private api: ApiService) {
    onAuthStateChanged(firebaseAuth, (u) => {
      if (u) {
        // 1. Aguarda token disponível
        // 2. Cria/busca usuário no banco via POST /auth/me
        // 3. Carrega perfil e verifica se está incompleto
        u.getIdToken().then(() => {
          this.api.post<any>('/auth/me', { role: 'CLIENT' }).subscribe({
            next: () => {
              this.profileService.loadFromApi().subscribe({ error: () => {} });
            },
            error: () => {
              this.profileService.loadFromApi().subscribe({ error: () => {} });
            },
          });
        });
      } else {
        this.profileService.clear();
      }
      this.user.set(u);
      this.loading.set(false);
    });
  }

  loginWithGoogle() {
    return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  registerWithEmail(name: string, email: string, password: string) {
    return createUserWithEmailAndPassword(firebaseAuth, email, password).then(cred =>
      updateProfile(cred.user, { displayName: name }).then(() => cred)
    );
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(firebaseAuth, email);
  }

  logout() {
    return signOut(firebaseAuth);
  }

  getIdToken(): Promise<string | null> {
    const u = this.user();
    return u ? u.getIdToken() : Promise.resolve(null);
  }
}
