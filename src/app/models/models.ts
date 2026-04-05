export type SportType = 'futevôlei' | 'vôlei' | 'beach tennis' | 'ambos';

export interface Arena {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  phone: string;
  description: string;
  sports: SportType[];
  open_hours: string;
  logo_color: string;
  logo_initials: string;
  rating: number;
  reviews_count: number;
  price_from: number;
  price_to: number;
}

export interface Court {
  id: string;
  arena_id: string;
  name: string;
  sport_type: SportType;
  status: 'disponível' | 'ocupada' | 'bloqueada';
  hourly_rate: number;
  description?: string;
}

export interface Booking {
  id: string;
  arena_id: string;
  client_name: string;
  client_phone?: string;
  court_id: string;
  date: string;
  start_hour: string;
  end_hour: string;
  payment_status: 'pago' | 'pendente';
  total_amount: number;
  duration_hours?: number;
}

export type DiaSemana = 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';
