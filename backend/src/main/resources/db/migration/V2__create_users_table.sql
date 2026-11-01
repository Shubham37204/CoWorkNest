CREATE TABLE users (
                       id           BIGSERIAL PRIMARY KEY,
                       email        VARCHAR(255) NOT NULL UNIQUE CHECK (email = lower(email)),
                       display_name VARCHAR(100) NOT NULL,
                       password     VARCHAR(255) NOT NULL
);
