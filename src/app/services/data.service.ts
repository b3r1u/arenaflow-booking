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
