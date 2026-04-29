import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateMensalistaDto {
  court_id:      string;
  client_name:   string;
  client_phone?: string;
  day_of_week:   number;   // 0=Dom, 1=Seg, ... 6=Sáb
  start_hour:    string;   // HH:00
  end_hour:      string;   // HH:00
}

export interface MensalistaResult {
  id:               string;
  court_id:         string;
  user_uid:         string;
  client_name:      string;
  client_phone:     string | null;
  day_of_week:      number;
  start_hour:       string;
  end_hour:         string;
  payment_status:   'PENDENTE' | 'PAGO' | 'CANCELADO';
  status:           'ATIVO' | 'INATIVO' | 'EXPIRADO';
  payment_date:     string | null;
  valid_until:      string | null;
  pix_qr_code:      string | null;
  pix_qr_code_url:  string | null;
  pix_expires_at:   string | null;
  pagarme_order_id: string | null;
  created_at:       string;
  court: {
    name: string;
    establishment: {
      name:          string;
      logo_color:    string;
      logo_initials: string | null;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class MensalistaService {
  constructor(private api: ApiService) {}

  async create(dto: CreateMensalistaDto): Promise<MensalistaResult> {
    return firstValueFrom(
      this.api.post<MensalistaResult>('/mensalistas', dto)
    );
  }

  async listMe(): Promise<MensalistaResult[]> {
    return firstValueFrom(
      this.api.get<MensalistaResult[]>('/mensalistas/me')
    );
  }

  async getOne(id: string): Promise<MensalistaResult> {
    return firstValueFrom(
      this.api.get<MensalistaResult>(`/mensalistas/${id}`)
    );
  }

  async cancel(id: string): Promise<void> {
    await firstValueFrom(
      this.api.delete<any>(`/mensalistas/${id}`)
    );
  }

  async renew(id: string): Promise<MensalistaResult> {
    return firstValueFrom(
      this.api.post<MensalistaResult>(`/mensalistas/${id}/renovar`, {})
    );
  }

  async getSlots(courtId: string, dayOfWeek: number): Promise<{ start_hour: string; end_hour: string }[]> {
    const r = await firstValueFrom(
      this.api.get<{ slots: { start_hour: string; end_hour: string }[] }>(
        '/mensalistas/slots',
        { court_id: courtId, day_of_week: String(dayOfWeek) }
      )
    );
    return r.slots;
  }
}
