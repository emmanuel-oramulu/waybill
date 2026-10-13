CREATE SCHEMA IF NOT EXISTS waybill_schema;

SET search_path TO waybill_schema;

CREATE TABLE IF NOT EXISTS links (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	
	url TEXT NOT NULL CHECK (
		url LIKE 'https://_%._%'
		OR url LIKE 'http://_%._%'
	),
	
	code TEXT UNIQUE NOT NULL CHECK (code ~ '^[A-Za-z0-9]{1,10}$'),
	
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clicks (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	
	link_id BIGINT NOT NULL REFERENCES links (id),

	clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cache_outbox (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	code TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'exhausted')) DEFAULT 'pending',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() ,
	retries INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_clicks_link_id
ON clicks (link_id);

CREATE INDEX IF NOT EXISTS idx_cache_outbox_status
ON cache_outbox (created_at) 
WHERE status = 'pending';

CREATE OR REPLACE VIEW activeurls AS 
SELECT url, code FROM links WHERE active;

