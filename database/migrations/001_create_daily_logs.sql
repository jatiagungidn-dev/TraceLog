CREATE TYPE log_category AS ENUM ('WORK', 'SCHOOL', 'PERSONAL');

CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    category log_category NOT NULL DEFAULT 'WORK',
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
    summary VARCHAR(255) NOT NULL,
    accomplishments TEXT NOT NULL,
    blockers TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_daily_log UNIQUE(user_id, log_date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date);