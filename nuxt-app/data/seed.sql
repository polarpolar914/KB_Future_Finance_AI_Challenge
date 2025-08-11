-- Schema and seed data for demo

-- insurance_markets
CREATE TABLE IF NOT EXISTS insurance_markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  metric TEXT,
  value_num NUMERIC,
  currency TEXT,
  base_year INTEGER,
  notes TEXT,
  source TEXT
);

INSERT INTO insurance_markets (category, metric, value_num, currency, base_year, notes, source) VALUES
('Cargo', 'GWP', 5000, 'USD', 2023, '', 'Sample'),
('Ocean Hull', 'GWP', 3200, 'USD', 2023, '', 'Sample'),
('Offshore Energy', 'GWP', 2700, 'USD', 2023, '', 'Sample'),
('Marine Liability', 'GWP', 1800, 'USD', 2023, '', 'Sample'),
('Trade Credit Insurance', 'Exposure', 8000, 'USD', 2023, '', 'Sample'),
('Political Risk Insurance', 'NewCommitments', 1200, 'USD', 2023, '', 'Sample'),
('MIGA', 'NewCommitments', 1000, 'USD', 2023, '', 'Sample');

-- deals
CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  incoterms TEXT,
  deposit_pct NUMERIC,
  seller TEXT,
  guarantor TEXT,
  insurer TEXT,
  status TEXT,
  contract_address TEXT,
  contract_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO deals (amount, currency, incoterms, deposit_pct, seller, guarantor, insurer, status) VALUES
(10000, 'USD', 'FOB', 0.2, 'SellerCo', 'GuaranteeCo', 'InsureCo', 'FUNDED');

-- deal_milestones
CREATE TABLE IF NOT EXISTS deal_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  ord INTEGER,
  description TEXT,
  status TEXT DEFAULT 'PENDING',
  confirmed_at DATETIME
);

INSERT INTO deal_milestones (deal_id, ord, description, status) VALUES
(1, 1, 'Shipment', 'PENDING'),
(1, 2, 'Proof of Delivery', 'PENDING');

-- event_logs
CREATE TABLE IF NOT EXISTS event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER,
  source TEXT,
  event_type TEXT,
  message TEXT,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO event_logs (deal_id, source, event_type, message) VALUES
(1, 'APP', 'CREATED', 'Deal created'),
(1, 'CHAIN', 'DEPOSIT', 'Escrow funded'),
(1, 'ORACLE', 'ORACLE', '{"type":"WAR_RISK","message":"AP rate updated"}'),
(1, 'APP', 'CLAIM', 'Buyer requested claim'),
(1, 'APP', 'PAYOUT', 'Insurance payout 5000 USD'),
(1, 'APP', 'FLOW', 'Escrow -> Seller 1000 USD');

-- risk_scores
CREATE TABLE IF NOT EXISTS risk_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  trader_history NUMERIC,
  route_risk NUMERIC,
  commodity_volatility NUMERIC,
  geopolitical_index NUMERIC,
  weather_forecast NUMERIC,
  network_health NUMERIC,
  ml_score NUMERIC,
  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO risk_scores (
    deal_id,
    trader_history,
    route_risk,
    commodity_volatility,
    geopolitical_index,
    weather_forecast,
    network_health,
    ml_score
) VALUES (1, 0.8, 0.6, 0.5, 0.7, 0.4, 0.9, 0.65);

-- stats key/value store
CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO stats (key, value) VALUES
('escrow_balance', '10000'),
('vault_balance', '5000'),
('pool_balance', '30000'),
('seller_balance', '0'),
('claims', '0'),
('guarantee_limit', '20000'),
('guarantee_balance', '15000');

-- payout_requests
CREATE TABLE IF NOT EXISTS payout_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal TEXT,
  amount NUMERIC,
  status TEXT
);

INSERT INTO payout_requests (deal, amount, status) VALUES
('Deal A', 500, 'PENDING');

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  path TEXT,
  status TEXT
);

INSERT INTO documents (name, path, status) VALUES
('Invoice.pdf', '/uploads/Invoice.pdf', 'Verified');

-- claim_nfts
CREATE TABLE IF NOT EXISTS claim_nfts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  token_id TEXT,
  metadata TEXT
);

-- pricing
CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  base_rate NUMERIC,
  risk_score NUMERIC,
  market_adjustment NUMERIC,
  premium_rate NUMERIC,
  premium_amount NUMERIC
);

INSERT INTO pricing (deal_id, base_rate, risk_score, market_adjustment, premium_rate, premium_amount) VALUES
    (1, 0.02, 0.65, 1.05, 0.0231, 23.1);