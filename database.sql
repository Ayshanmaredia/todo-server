CREATE DATABASE listicleBoard;


CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    CONSTRAINT user_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.groups
(
    id serial NOT NULL,
    name character varying NOT NULL,
    owner_id integer NOT NULL,
    CONSTRAINT group_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.group_user_mapping
(
    id serial NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.list
(
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    owner_type integer NOT NULL,
    owner_type_id integer NOT NULL,
    description text,
    status integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.invites
(
    id serial NOT NULL,
    token character varying(255) NOT NULL,
    invited_by integer NOT NULL,
	invited_to character varying(255) NOT NULL,
	group_id integer NOT NULL,
    status integer NOT NULL DEFAULT 0
);

ALTER TABLE IF EXISTS public.invites
    ADD CONSTRAINT invited_by FOREIGN KEY (invited_by)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.invites
    ADD CONSTRAINT group_id FOREIGN KEY (group_id)
    REFERENCES public.groups (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.groups
    ADD CONSTRAINT owner_id FOREIGN KEY (owner_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.group_user_mapping
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.group_user_mapping
    ADD CONSTRAINT group_id FOREIGN KEY (group_id)
    REFERENCES public.groups (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;