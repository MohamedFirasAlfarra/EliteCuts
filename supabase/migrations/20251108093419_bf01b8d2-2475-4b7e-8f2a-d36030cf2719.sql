CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'canceled');

ALTER TABLE appointments 
ADD COLUMN status appointment_status NOT NULL DEFAULT 'pending';