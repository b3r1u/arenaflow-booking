import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message$ = new Subject<string | null>();

  show(msg: string, duration = 3000) {
    this.message$.next(msg);
    setTimeout(() => this.message$.next(null), duration);
  }
}
