-- ============================================================
-- Réagim — Schéma Supabase
-- Copiez-collez ce SQL dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Aubergistes (gestionnaires de biens)
CREATE TABLE IF NOT EXISTS aubergistes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biens immobiliers
CREATE TABLE IF NOT EXISTS biens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  adresse TEXT NOT NULL,
  commune TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  capacite INTEGER NOT NULL DEFAULT 4,
  type TEXT NOT NULL DEFAULT 'maison' CHECK (type IN ('maison', 'appartement', 'studio')),
  statut TEXT NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'occupe', 'nettoyage', 'maintenance')),
  aubergiste_id UUID REFERENCES aubergistes(id),
  prix_semaine INTEGER,
  photo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bien_id UUID REFERENCES biens(id) ON DELETE CASCADE,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_telephone TEXT,
  date_arrivee DATE NOT NULL,
  date_depart DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'confirmee' CHECK (statut IN ('confirmee', 'en_cours', 'terminee', 'annulee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer le real-time sur la table biens
ALTER TABLE biens REPLICA IDENTITY FULL;

-- Row Level Security (désactivé pour le prototype)
ALTER TABLE aubergistes ENABLE ROW LEVEL SECURITY;
ALTER TABLE biens ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_aubergistes" ON aubergistes FOR SELECT USING (true);
CREATE POLICY "public_read_biens" ON biens FOR SELECT USING (true);
CREATE POLICY "public_update_biens" ON biens FOR UPDATE USING (true);
CREATE POLICY "public_read_reservations" ON reservations FOR SELECT USING (true);

-- ============================================================
-- SEED DATA — 4 aubergistes, 12 biens, réservations du jour
-- ============================================================

INSERT INTO aubergistes (id, nom, email, telephone) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Jean-Pierre Moreau',  'jp.moreau@reagim.fr',   '06 12 34 56 78'),
  ('a1000000-0000-0000-0000-000000000002', 'Marie Dubois',        'marie.dubois@reagim.fr','06 23 45 67 89'),
  ('a1000000-0000-0000-0000-000000000003', 'Pierre Lambert',      'p.lambert@reagim.fr',   '06 34 56 78 90'),
  ('a1000000-0000-0000-0000-000000000004', 'Sophie Martin',       's.martin@reagim.fr',    '06 45 67 89 01');

INSERT INTO biens (id, nom, adresse, commune, latitude, longitude, capacite, type, statut, aubergiste_id, prix_semaine) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Villa Les Mouettes',       '12 rue de la Mer',       'Saint-Martin-de-Ré',   46.2035, -1.3641, 8, 'maison',      'occupe',      'a1000000-0000-0000-0000-000000000001', 3200),
  ('b1000000-0000-0000-0000-000000000002', 'Maison du Port',           '3 quai Nicolas Baudin',  'Saint-Martin-de-Ré',   46.2011, -1.3658, 6, 'maison',      'disponible',  'a1000000-0000-0000-0000-000000000001', 2400),
  ('b1000000-0000-0000-0000-000000000003', 'Studio Océan',             '7 avenue des Chaumes',   'Saint-Martin-de-Ré',   46.2048, -1.3612, 2, 'studio',      'nettoyage',   'a1000000-0000-0000-0000-000000000001',  890),
  ('b1000000-0000-0000-0000-000000000004', 'Le Patio Fleuri',          '25 rue de la Flotte',    'La Flotte',            46.1843, -1.3229, 6, 'maison',      'occupe',      'a1000000-0000-0000-0000-000000000002', 2100),
  ('b1000000-0000-0000-0000-000000000005', 'Chalet du Bois Blanc',     '8 impasse des Pins',     'La Flotte',            46.1867, -1.3251, 4, 'maison',      'disponible',  'a1000000-0000-0000-0000-000000000002', 1600),
  ('b1000000-0000-0000-0000-000000000006', 'Appartement Brise Marine', '15 boulevard de la Mer', 'Le Bois-Plage-en-Ré',  46.1738, -1.3842, 4, 'appartement', 'occupe',      'a1000000-0000-0000-0000-000000000003', 1400),
  ('b1000000-0000-0000-0000-000000000007', 'Villa Soleil d''Île',      '2 chemin des Vignes',    'Le Bois-Plage-en-Ré',  46.1721, -1.3868, 10,'maison',      'maintenance', 'a1000000-0000-0000-0000-000000000003', 4200),
  ('b1000000-0000-0000-0000-000000000008', 'Le Refuge des Pêcheurs',   '34 rue du Moulin',       'Le Bois-Plage-en-Ré',  46.1752, -1.3819, 5, 'maison',      'disponible',  'a1000000-0000-0000-0000-000000000003', 1900),
  ('b1000000-0000-0000-0000-000000000009', 'Maison Arsinoise',         '6 place de la République','Ars-en-Ré',           46.2094, -1.5228, 6, 'maison',      'occupe',      'a1000000-0000-0000-0000-000000000004', 2200),
  ('b1000000-0000-0000-0000-000000000010', 'Studio des Marais',        '11 route de Loix',       'Loix',                 46.2347, -1.4718, 2, 'studio',      'nettoyage',   'a1000000-0000-0000-0000-000000000004',  750),
  ('b1000000-0000-0000-0000-000000000011', 'Villa Bellevue',           '1 avenue de l''Océan',   'Les Portes-en-Ré',     46.2563, -1.5882, 8, 'maison',      'disponible',  'a1000000-0000-0000-0000-000000000004', 3500),
  ('b1000000-0000-0000-0000-000000000012', 'L''Ancre Dorée',           '5 rue du Sémaphore',     'Sainte-Marie-de-Ré',   46.1568, -1.2941, 4, 'appartement', 'occupe',      'a1000000-0000-0000-0000-000000000001', 1300);

-- Réservations (aujourd'hui = 2026-05-21)
INSERT INTO reservations (bien_id, client_nom, client_email, date_arrivee, date_depart, statut) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Famille Rousseau',   'rousseau@email.fr', '2026-05-18', '2026-05-25', 'en_cours'),
  ('b1000000-0000-0000-0000-000000000004', 'Thomas Petit',       'thomas@email.fr',   '2026-05-17', '2026-05-24', 'en_cours'),
  ('b1000000-0000-0000-0000-000000000006', 'Claire et Marc D.',  'claire@email.fr',   '2026-05-19', '2026-05-26', 'en_cours'),
  ('b1000000-0000-0000-0000-000000000009', 'Famille Bernard',    'bernard@email.fr',  '2026-05-14', '2026-05-21', 'en_cours'),
  ('b1000000-0000-0000-0000-000000000012', 'Amélie Fontaine',    'amelie@email.fr',   '2026-05-20', '2026-05-27', 'en_cours'),
  -- Check-ins aujourd'hui
  ('b1000000-0000-0000-0000-000000000002', 'Nicolas Garnier',    'garnier@email.fr',  '2026-05-21', '2026-05-28', 'confirmee'),
  ('b1000000-0000-0000-0000-000000000005', 'Sophie Legrand',     'sophie@email.fr',   '2026-05-21', '2026-05-28', 'confirmee'),
  -- Check-out aujourd'hui
  ('b1000000-0000-0000-0000-000000000009', 'Martin Lefebvre',    'martin@email.fr',   '2026-05-14', '2026-05-21', 'terminee');
