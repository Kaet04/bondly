# Bondly

App per coppie costruita con React + Vite + Supabase.

## Stack

- **Frontend**: React 18, Vite, CSS-in-JS inline
- **Backend**: Supabase (Auth, Postgres, Realtime)
- **Deploy**: Vite build statica (`dist/`)

## Struttura del progetto

```
src/
  bondly.jsx        # App intera (componente unico)
  supabaseClient.js # Client Supabase
  main.jsx          # Entry point
```

## Schema Supabase

### Tabelle

**`profiles`**
| colonna | tipo | note |
|---|---|---|
| `id` | uuid | FK → `auth.users` |
| `name` | text | |
| `couple_id` | uuid | FK → `couples` |
| `daily_answer` | jsonb | `{day: number, answer: string}` |

**`couples`**
| colonna | tipo | note |
|---|---|---|
| `id` | uuid | PK |
| `member_a` | uuid | FK → `auth.users` |
| `member_b` | uuid | FK → `auth.users` |
| `invite_code` | text | 6 caratteri univoci |

**`game_turns`**
| colonna | tipo | note |
|---|---|---|
| `id` | uuid | PK |
| `couple_id` | uuid | FK → `couples` |
| `game_id` | text | es. `"questions"`, `"values"` |
| `question_index` | integer | indice della domanda |
| `player_a` | uuid | chi ha iniziato il turno |
| `answer_a` | text | risposta di player_a |
| `player_b` | uuid | chi ha completato il turno |
| `answer_b` | text | risposta di player_b |
| `created_at` | timestamptz | |

Vincolo: `unique(couple_id, game_id, question_index)`

### SQL di setup

```sql
create table if not exists game_turns (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid references couples(id) not null,
  game_id        text not null,
  question_index integer not null,
  player_a       uuid references auth.users(id) not null,
  answer_a       text not null,
  player_b       uuid references auth.users(id),
  answer_b       text,
  created_at     timestamptz default now(),
  unique(couple_id, game_id, question_index)
);

alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table couples;
alter publication supabase_realtime add table game_turns;
```

## Funzionalità principali

### Sistema coppia
Dopo il login, se l'utente non ha un `couple_id`:
- **Crea coppia**: genera un invite code di 6 caratteri, crea la riga in `couples`, mostra il link `/unisciti/CODICE`
- **Unisciti con codice**: cerca la coppia per `invite_code`, imposta `member_b`, aggiorna `profiles.couple_id`
- Il link `/unisciti/CODICE` pre-compila il campo codice all'apertura

### Domanda del giorno
- Una domanda al giorno, uguale per entrambi i partner
- Risposta salvata su `profiles.daily_answer` come `{day, answer}`
- La risposta del partner appare in tempo reale via Supabase Realtime

### Giochi a turni
- Player A sceglie una risposta → viene salvata in `game_turns` → schermata "turno inviato"
- Player B vede la card "IL TUO TURNO" in Home → risponde → vede entrambe le risposte nel reveal
- Home si aggiorna in tempo reale quando arriva un turno o quando un turno viene completato

## Sviluppo locale

```bash
# Installa dipendenze
npm install

# Crea il file delle variabili d'ambiente
cp .env.example .env
# → imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Avvia il dev server
npm run dev

# Build di produzione
npm run build
```

## Variabili d'ambiente

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
