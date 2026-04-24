import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Booking } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  bookings$ = this.bookingsSubject.asObservable();

  getBookings(): Booking[] { return this.bookingsSubject.getValue(); }

  isSlotOccupied(arenaId: string, courtId: string, date: string, start: string, end: string): boolean {
    return this.getBookings().some(b =>
      b.arena_id   === arenaId &&
      b.court_id   === courtId &&
      b.date       === date &&
      b.start_hour <  end &&
      b.end_hour   >  start &&
      b.payment_status !== 'cancelado'
    );
  }

  /** Carrega slots ocupados vindos da API para uma quadra/data específica */
  loadOccupiedSlots(arenaId: string, courtId: string, date: string, slots: { start_hour: string; end_hour: string }[]): void {
    const others = this.getBookings().filter(
      b => !(b.arena_id === arenaId && b.court_id === courtId && b.date === date)
    );
    const occupied: Booking[] = slots.map((s, i) => ({
      id: `occ-${arenaId}-${courtId}-${date}-${i}`,
      arena_id: arenaId,
      court_id: courtId,
      user_uid: '',
      client_name: '',
      date,
      start_hour: s.start_hour,
      end_hour: s.end_hour,
      payment_status: 'pendente',
      total_amount: 0,
      paid_amount: 0,
      payment_option: '50',
    }));
    this.bookingsSubject.next([...others, ...occupied]);
  }

  addBooking(b: Omit<Booking, 'id'> & { id_hint?: string }): Booking {
    const { id_hint, ...rest } = b as any;
    const booking: Booking = { ...rest, id: id_hint || Date.now().toString() };
    this.bookingsSubject.next([...this.getBookings(), booking]);
    return booking;
  }

  getBookingsForUser(uid: string): Booking[] {
    return this.getBookings().filter(b => b.user_uid === uid);
  }

  cancelBooking(id: string): void {
    this.bookingsSubject.next(
      this.getBookings().map(b => b.id === id ? { ...b, payment_status: 'cancelado' } : b)
    );
  }
}
