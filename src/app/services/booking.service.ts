import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CreateBookingDto {
  arena_id:       string;
  court_id:       string;
  client_name:      string;
  client_phone?:    string;
  client_document?: string;
  date:           string;
  start_hour:     string;
  end_hour:       string;
  payment_option: '50' | '100';
  split_payment:  boolean;
  num_players?:   number;
}

export interface BookingResult {
  id:              string;
  arena_id:        string;
  arena_name:      string;
  court_id:        string;
  court_name:      string;
  client_name:     string;
  date:            string;
  start_hour:      string;
  end_hour:        string;
  duration_hours:  number;
  total_amount:    number;
  paid_amount:     number;
  payment_option:  '50' | '100';
  payment_status:  string;
  split_payment:   boolean;
  num_players?:    number;
  pix_qr_code?:    string;
  pix_qr_code_url?: string;
  pix_expires_at?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(
    private api: ApiService,
    private auth: AuthService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingResult> {
    const token = await this.auth.getIdToken();
    const res = await firstValueFrom(
      this.api.post<{ booking: BookingResult }>('/bookings', dto)
    );
    return res.booking;
  }

  async getBooking(id: string): Promise<BookingResult> {
    const res = await firstValueFrom(
      this.api.get<{ booking: BookingResult }>(`/bookings/${id}`)
    );
    return res.booking;
  }

  async getBookingSilent(id: string): Promise<BookingResult> {
    const res = await firstValueFrom(
      this.api.getSilent<{ booking: BookingResult }>(`/bookings/${id}`)
    );
    return res.booking;
  }

  async simulatePayment(id: string): Promise<void> {
    await firstValueFrom(
      this.api.post<any>(`/bookings/${id}/simulate-payment`, {})
    );
  }

  async getAvailability(arenaId: string, courtId: string, date: string): Promise<{ start_hour: string; end_hour: string }[]> {
    const res = await firstValueFrom(
      this.api.get<{ slots: { start_hour: string; end_hour: string }[] }>(
        `/bookings/availability?arena_id=${arenaId}&court_id=${courtId}&date=${date}`
      )
    );
    return res.slots;
  }

  async getMyBookings(): Promise<BookingResult[]> {
    const res = await firstValueFrom(
      this.api.get<{ bookings: BookingResult[] }>('/bookings/me')
    );
    return res.bookings;
  }
}
