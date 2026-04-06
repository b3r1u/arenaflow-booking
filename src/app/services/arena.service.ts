import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Arena, Court } from '../models/models';
import { tap } from 'rxjs';

interface ArenasResponse { arenas: Arena[]; }
interface ArenaResponse  { arena:  Arena;  }

@Injectable({ providedIn: 'root' })
export class ArenaService {
  private _arenas = signal<Arena[]>([]);
  private _loading = signal(false);
  private _error   = signal<string | null>(null);

  readonly arenas  = this._arenas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  constructor(private api: ApiService) {}

  loadArenas(filters?: { city?: string; sport?: string }) {
    this._loading.set(true);
    this._error.set(null);

    const params: Record<string, string> = {};
    if (filters?.city)  params['city']  = filters.city;
    if (filters?.sport) params['sport'] = filters.sport;

    return this.api.get<ArenasResponse>('/arenas', params).pipe(
      tap({
        next:  ({ arenas }) => { this._arenas.set(arenas); this._loading.set(false); },
        error: (err)        => { this._error.set('Erro ao carregar arenas'); this._loading.set(false); console.error(err); },
      })
    );
  }

  getArenaById(id: string) {
    return this.api.get<ArenaResponse>(`/arenas/${id}`);
  }

  getCourtsForArena(arenaId: string): Court[] {
    const arena = this._arenas().find(a => a.id === arenaId);
    return (arena as any)?.courts ?? [];
  }
}
