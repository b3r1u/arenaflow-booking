# ArenaFlow Booking

App client-side de descoberta e reserva de quadras esportivas. Permite que clientes encontrem arenas, escolham quadras, selecionem horários e finalizem o pagamento via PIX — tudo em um fluxo rápido e intuitivo.

Parte do ecossistema **ArenaFlow**, junto ao [app administrativo](https://github.com/b3r1u/arenaflow) usado pelas arenas para gerenciar reservas e clientes.

---

## Funcionalidades

- **Explorar arenas** — busca por nome/bairro, filtro por cidade e modalidade esportiva
- **Detalhe da arena** — quadras disponíveis, horários de funcionamento, preços e avaliações
- **Fluxo de reserva em 4 etapas** — seleção de quadra → data e horário → dados do cliente → confirmação PIX
- **Minhas reservas** — consulta de histórico de reservas por nome do cliente
- **Dark mode** — alternância entre tema claro e escuro com persistência via `localStorage`

## Tecnologias

- [Angular 17](https://angular.io/) — standalone components
- [Tailwind CSS](https://tailwindcss.com/) — estilização utilitária
- [Material Icons](https://fonts.google.com/icons) — ícones

## Rodar localmente

```bash
npm install
ng serve --port 4201
```

Acesse em `http://localhost:4201`

## Build

```bash
ng build
```

Os artefatos serão gerados em `dist/arenaflow-booking/`.
