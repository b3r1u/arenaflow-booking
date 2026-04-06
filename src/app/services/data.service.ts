import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Arena, Booking, Court, DiaSemana } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {

  private arenasSubject = new BehaviorSubject<Arena[]>([
    {
      id: '1', name: 'Arena Beach Mais', city: 'São Paulo', neighborhood: 'Moema',
      address: 'Rua das Palmeiras, 123 — Moema', phone: '(11) 99999-0001',
      description: 'A melhor arena de areia da zona sul. Estrutura completa com vestiários, lanchonete e estacionamento.',
      sports: ['futevôlei', 'vôlei'], open_hours: '07:00–23:00',
      logo_color: '#22a55c', logo_initials: 'AB',
      rating: 4.8, reviews_count: 124, price_from: 80, price_to: 100,
    },
    {
      id: '2', name: 'Vôlei Club SP', city: 'São Paulo', neighborhood: 'Pinheiros',
      address: 'Av. Rebouças, 456 — Pinheiros', phone: '(11) 98888-0002',
      description: 'Clube especializado em vôlei de praia com quadras profissionais e areia selecionada.',
      sports: ['vôlei'], open_hours: '06:00–22:00',
      logo_color: '#3b82f6', logo_initials: 'VC',
      rating: 4.6, reviews_count: 87, price_from: 90, price_to: 90,
    },
    {
      id: '3', name: 'Arena Norte', city: 'São Paulo', neighborhood: 'Santana',
      address: 'Rua Voluntários da Pátria, 789 — Santana', phone: '(11) 97777-0003',
      description: 'Espaço completo para esportes de areia. 4 quadras com iluminação de LED para jogar à noite.',
      sports: ['futevôlei', 'vôlei', 'beach tennis'], open_hours: '07:00–22:00',
      logo_color: '#f59e0b', logo_initials: 'AN',
      rating: 4.5, reviews_count: 201, price_from: 70, price_to: 95,
    },
    {
      id: '4', name: 'Beach Sports Campinas', city: 'Campinas', neighborhood: 'Cambuí',
      address: 'Av. José de Souza Campos, 321 — Cambuí', phone: '(19) 99999-0004',
      description: 'A maior arena de esportes de areia de Campinas. Eventos e campeonatos toda semana.',
      sports: ['futevôlei', 'vôlei', 'beach tennis'], open_hours: '08:00–22:00',
      logo_color: '#ef4444', logo_initials: 'BS',
      rating: 4.7, reviews_count: 156, price_from: 75, price_to: 95,
    },
    {
      id: '5', name: 'Arena Beira Rio', city: 'Porto Alegre', neighborhood: 'Moinhos de Vento',
      address: 'Rua Ramiro Barcelos, 654 — Moinhos', phone: '(51) 99999-0005',
      description: 'Arena premium com estrutura de alto nível e vista privilegiada.',
      sports: ['vôlei', 'futevôlei'], open_hours: '07:00–23:00',
      logo_color: '#8b5cf6', logo_initials: 'AR',
      rating: 4.9, reviews_count: 73, price_from: 85, price_to: 110,
    },
    {
      id: '6', name: 'Sun Beach BH', city: 'Belo Horizonte', neighborhood: 'Savassi',
      address: 'Rua Pernambuco, 900 — Savassi', phone: '(31) 99999-0006',
      description: 'A queridinha da Savassi para quem ama esportes de praia.',
      sports: ['beach tennis', 'vôlei'], open_hours: '06:30–21:00',
      logo_color: '#f97316', logo_initials: 'SB',
      rating: 4.4, reviews_count: 92, price_from: 70, price_to: 85,
    },
  ]);

  private courtsSubject = new BehaviorSubject<Court[]>([
    // Arena 1
    { id: 'c1a1', arena_id: '1', name: 'Quadra 1', sport_type: 'futevôlei', status: 'disponível', hourly_rate: 80,  description: 'Areia grossa premium, iluminação noturna' },
    { id: 'c2a1', arena_id: '1', name: 'Quadra 2', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 100, description: 'Coberta com piso emborrachado' },
    { id: 'c3a1', arena_id: '1', name: 'Quadra 3', sport_type: 'ambos',     status: 'bloqueada',  hourly_rate: 80,  description: 'Em manutenção' },
    // Arena 2
    { id: 'c1a2', arena_id: '2', name: 'Quadra A', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 90,  description: 'Quadra oficial com rede profissional' },
    { id: 'c2a2', arena_id: '2', name: 'Quadra B', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 90,  description: 'Ideal para grupos e iniciantes' },
    // Arena 3
    { id: 'c1a3', arena_id: '3', name: 'Quadra 1', sport_type: 'futevôlei', status: 'disponível', hourly_rate: 70,  description: 'Areia fina importada' },
    { id: 'c2a3', arena_id: '3', name: 'Quadra 2', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 80,  description: 'Coberta, ótima para dias de chuva' },
    { id: 'c3a3', arena_id: '3', name: 'Quadra 3', sport_type: 'beach tennis', status: 'disponível', hourly_rate: 95, description: 'Com equipamentos inclusos' },
    { id: 'c4a3', arena_id: '3', name: 'Quadra 4', sport_type: 'ambos',     status: 'disponível', hourly_rate: 80,  description: 'Multiuso com marcações oficiais' },
    // Arena 4
    { id: 'c1a4', arena_id: '4', name: 'Quadra 1', sport_type: 'futevôlei', status: 'disponível', hourly_rate: 75,  description: 'Principal — torneios oficiais' },
    { id: 'c2a4', arena_id: '4', name: 'Quadra 2', sport_type: 'beach tennis', status: 'disponível', hourly_rate: 95, description: 'Equipamentos inclusos' },
    { id: 'c3a4', arena_id: '4', name: 'Quadra 3', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 80,  description: 'Coberta e climatizada' },
    // Arena 5
    { id: 'c1a5', arena_id: '5', name: 'Quadra Premium 1', sport_type: 'vôlei',     status: 'disponível', hourly_rate: 110, description: 'Vista privilegiada, areia selecionada' },
    { id: 'c2a5', arena_id: '5', name: 'Quadra Premium 2', sport_type: 'futevôlei', status: 'disponível', hourly_rate: 85,  description: 'Iluminação LED de alta potência' },
    // Arena 6
    { id: 'c1a6', arena_id: '6', name: 'Quadra Beach 1', sport_type: 'beach tennis', status: 'disponível', hourly_rate: 70, description: 'Raquetes e bolas disponíveis' },
    { id: 'c2a6', arena_id: '6', name: 'Quadra Beach 2', sport_type: 'vôlei',       status: 'disponível', hourly_rate: 85, description: 'Coberta, ideal para todos os níveis' },
  ]);

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  arenas$   = this.arenasSubject.asObservable();
  courts$   = this.courtsSubject.asObservable();
  bookings$ = this.bookingsSubject.asObservable();

  getArenas():   Arena[]   { return this.arenasSubject.getValue(); }
  getCourts():   Court[]   { return this.courtsSubject.getValue(); }
  getBookings(): Booking[] { return this.bookingsSubject.getValue(); }

  getCourtsForArena(arenaId: string): Court[] {
    return this.getCourts().filter(c => c.arena_id === arenaId);
  }

  isSlotOccupied(arenaId: string, courtId: string, date: string, start: string, end: string): boolean {
    return this.getBookings().some(b =>
      b.arena_id   === arenaId &&
      b.court_id   === courtId &&
      b.date       === date &&
      b.start_hour <  end &&
      b.end_hour   >  start
    );
  }

  addBooking(b: Omit<Booking, 'id'> & { id_hint?: string }): Booking {
    const { id_hint, ...rest } = b as any;
    const booking: Booking = { ...rest, id: id_hint || Date.now().toString() };
    this.bookingsSubject.next([...this.getBookings(), booking]);
    return booking;
  }

  getBookingsForClient(name: string): Booking[] {
    return this.getBookings().filter(b => b.client_name.toLowerCase().includes(name.toLowerCase()));
  }

  cancelBooking(id: string): void {
    this.bookingsSubject.next(
      this.getBookings().map(b => b.id === id ? { ...b, payment_status: 'cancelado' } : b)
    );
  }
}
