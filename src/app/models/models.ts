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
  logo_url?: string | null;
  rating: number;
  reviews_count: number;
  price_from: number;
  price_to: number;
  courts?: Court[];
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
  arena_name?: string;
  court_id: string;
  court_name?: string;
  user_uid: string;
  client_name: string;
  client_phone?: string;
  date: string;
  start_hour: string;
  end_hour: string;
  payment_status: 'pago' | 'pendente' | 'parcial' | 'cancelado';
  total_amount: number;
  paid_amount: number;
  payment_option: '50' | '100';
  duration_hours?: number;
  split_payment?: boolean;
  num_players?: number;
}

export type DiaSemana = 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';
