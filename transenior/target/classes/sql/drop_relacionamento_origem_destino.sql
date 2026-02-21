-- Remove as colunas id_origem e id_destino da tabela relacionamento_motorista_idoso.
-- Os endereços passam a ser obtidos do idoso (tabela enderecos via idosos.id_origem / idosos.id_destino).
-- Execute este script uma vez no banco (ex.: psql, DBeaver ou H2 console).

ALTER TABLE relacionamento_motorista_idoso DROP COLUMN IF EXISTS id_origem;
ALTER TABLE relacionamento_motorista_idoso DROP COLUMN IF EXISTS id_destino;
