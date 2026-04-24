import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface Review {
  id: string;
  user_name: string;
  stars: number;
  comment?: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private api: ApiService) {}

  /** Envia uma avaliação para uma arena (autenticado). */
  async createReview(data: {
    establishment_id: string;
    booking_id?: string;
    stars: number;
    comment?: string;
    user_name?: string;
  }): Promise<Review> {
    const res = await firstValueFrom(
      this.api.post<{ review: Review }>('/reviews', data)
    );
    return res.review;
  }

  /** Lista avaliações de uma arena (público). */
  async getReviews(arenaId: string): Promise<Review[]> {
    const res = await firstValueFrom(
      this.api.get<{ reviews: Review[] }>(`/arenas/${arenaId}/reviews`)
    );
    return res.reviews;
  }

  /** Retorna IDs de reservas que o usuário autenticado já avaliou. */
  async getMyReviewedBookingIds(): Promise<string[]> {
    const res = await firstValueFrom(
      this.api.get<{ booking_ids: string[] }>('/reviews/mine')
    );
    return res.booking_ids;
  }
}
