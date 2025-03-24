-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text COLLATE pg_catalog."default",
    name text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    password text COLLATE pg_catalog."default" NOT NULL,
    role text COLLATE pg_catalog."default" DEFAULT 'user'::text,
    firstname text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_id_key UNIQUE (id),
    CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['user'::text, 'admin'::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

ALTER TABLE IF EXISTS public.users
    ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE public.users TO postgres;


-- Table: public.access_codes

-- DROP TABLE IF EXISTS public.access_codes;

CREATE TABLE IF NOT EXISTS public.access_codes
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text COLLATE pg_catalog."default" NOT NULL,
    user_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT access_codes_pkey PRIMARY KEY (id),
    CONSTRAINT access_codes_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.access_codes
    OWNER to postgres;


GRANT ALL ON TABLE public.access_codes TO postgres;


-- Table: public.access_logs

-- DROP TABLE IF EXISTS public.access_logs;

CREATE TABLE IF NOT EXISTS public.access_logs
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    access_type text COLLATE pg_catalog."default" NOT NULL,
    identifier text COLLATE pg_catalog."default" NOT NULL,
    user_id uuid,
    success boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT access_logs_pkey PRIMARY KEY (id),
    CONSTRAINT access_logs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT access_logs_access_type_check CHECK (access_type = ANY (ARRAY['rfid'::text, 'keypad'::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.access_logs
    OWNER to postgres;



GRANT ALL ON TABLE public.access_logs TO postgres;


-- Table: public.rfid_cards

-- DROP TABLE IF EXISTS public.rfid_cards;

CREATE TABLE IF NOT EXISTS public.rfid_cards
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    card_id text COLLATE pg_catalog."default" NOT NULL,
    user_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rfid_cards_pkey PRIMARY KEY (id),
    CONSTRAINT rfid_cards_card_id_key UNIQUE (card_id),
    CONSTRAINT rfid_cards_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rfid_cards
    OWNER to postgres;



GRANT ALL ON TABLE public.rfid_cards TO postgres;


-- Table: public.user_rfid

-- DROP TABLE IF EXISTS public.user_rfid;

CREATE TABLE IF NOT EXISTS public.user_rfid
(
    user_id uuid NOT NULL,
    rfid_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_rfid_pkey PRIMARY KEY (user_id, rfid_id),
    CONSTRAINT user_rfid_rfid_id_fkey FOREIGN KEY (rfid_id)
        REFERENCES public.rfid_cards (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT user_rfid_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_rfid
    OWNER to postgres;


GRANT ALL ON TABLE public.user_rfid TO postgres;
