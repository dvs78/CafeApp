CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente TEXT NOT NULL
);

INSERT INTO clientes (cliente)
VALUES 
('Dr. Eduardo'),
('Grupo Palheta'),
('Marcus Veiga');


CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    cliente_id UUID NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

INSERT INTO usuarios (usuario, email, senha, cliente_id)
VALUES (
    'Daniel Veiga',
    'daniel@email.com',
    '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', -- hash bcrypt
    (SELECT id FROM clientes WHERE cliente = 'Dr. Eduardo')
);


CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    safra TEXT NOT NULL,
    lavoura TEXT NOT NULL,
    servico TEXT NOT NULL,

    data DATE NOT NULL,
    status TEXT NOT NULL,

    produto TEXT,
    unidade TEXT,
    quantidade NUMERIC(10,2),

    usuario_id UUID REFERENCES usuarios(id),
    cliente_id UUID REFERENCES clientes(id),

    criado_em TIMESTAMP DEFAULT NOW()
);
