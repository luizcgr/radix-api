BEGIN;

-- Limpa massa anterior da pessoa 1 no periodo de 04/2025 ate 02/2026.
DELETE FROM tb_devolucao
WHERE
    pessoa_id = 1
    AND (
        (
            ano_referencia = 2025
            AND mes_referencia >= 4
        )
        OR (
            ano_referencia = 2026
            AND mes_referencia <= 2
        )
    );

WITH
    meses AS (
        SELECT (
                DATE '2025-04-01' + (INTERVAL '1 month' * i)
            )::date AS ref_date
        FROM generate_series(0, 10) AS s (i)
    ),
    meses_sem_devolucao AS (
        -- Exatamente 3 meses sem devolucao.
        SELECT unnest(
                ARRAY[
                    DATE '2025-06-01', DATE '2025-10-01', DATE '2026-01-01'
                ]
            ) AS ref_date
    ),
    meses_com_devolucao AS (
        SELECT m.ref_date, row_number() OVER (
                ORDER BY m.ref_date
            ) AS seq
        FROM
            meses m
            LEFT JOIN meses_sem_devolucao s ON s.ref_date = m.ref_date
        WHERE
            s.ref_date IS NULL
    )
INSERT INTO
    tb_devolucao (
        status,
        data_criacao,
        mes_referencia,
        ano_referencia,
        valor_dizimo,
        valor_fundo_comunhao,
        pessoa_id,
        solicitante_id,
        data_pagamento,
        pagamento_id,
        url_pagamento,
        numero_pagamento,
        codigo_cliente
    )
SELECT
    'pago' AS status,
    (ref_date + INTERVAL '5 day')::timestamp AS data_criacao,
    EXTRACT(
        MONTH
        FROM ref_date
    )::int AS mes_referencia,
    EXTRACT(
        YEAR
        FROM ref_date
    )::int AS ano_referencia,
    ROUND(
        (150 + ((seq * 57) % 451))::numeric,
        2
    ) AS valor_dizimo,
    ROUND(
        (75 + ((seq * 29) % 226))::numeric,
        2
    ) AS valor_fundo_comunhao,
    1 AS pessoa_id,
    1 AS solicitante_id,
    (ref_date + INTERVAL '7 day')::timestamp AS data_pagamento,
    'seed-pag-1-' || to_char(ref_date, 'YYYYMM') AS pagamento_id,
    'https://pagamento.teste/devolucao/1/' || to_char(ref_date, 'YYYYMM') AS url_pagamento,
    'SEED-NR-1-' || to_char(ref_date, 'YYYYMM') AS numero_pagamento,
    'SEED-CLI-1' AS codigo_cliente
FROM meses_com_devolucao
ORDER BY ref_date;

-- Limpa massa anterior das pessoas 2 e 3 no periodo de 04/2025 ate o mes atual.
DELETE FROM tb_devolucao
WHERE
    pessoa_id IN (2, 3)
    AND (
        (
            ano_referencia = 2025
            AND mes_referencia >= 4
        )
        OR (
            ano_referencia > 2025
            AND make_date(
                ano_referencia,
                mes_referencia,
                1
            ) <= date_trunc('month', current_date)::date
        )
    );

WITH
    pessoas AS (
        SELECT unnest(ARRAY[2, 3]) AS pessoa_id
    ),
    meses_atual AS (
        SELECT generate_series(
                DATE '2025-04-01', date_trunc('month', current_date)::date, INTERVAL '1 month'
            )::date AS ref_date
    ),
    base AS (
        SELECT p.pessoa_id, m.ref_date, row_number() OVER (
                PARTITION BY
                    p.pessoa_id
                ORDER BY m.ref_date
            ) AS seq
        FROM pessoas p
            CROSS JOIN meses_atual m
    ),
    meses_com_devolucao_23 AS (
        -- Exatamente 3 meses sem devolucao por pessoa: sequencias 3, 7 e 11.
        SELECT pessoa_id, ref_date, seq
        FROM base
        WHERE
            seq NOT IN (3, 7, 11)
    )
INSERT INTO
    tb_devolucao (
        status,
        data_criacao,
        mes_referencia,
        ano_referencia,
        valor_dizimo,
        valor_fundo_comunhao,
        pessoa_id,
        solicitante_id,
        data_pagamento,
        pagamento_id,
        url_pagamento,
        numero_pagamento,
        codigo_cliente
    )
SELECT
    'pago' AS status,
    (ref_date + INTERVAL '5 day')::timestamp AS data_criacao,
    EXTRACT(
        MONTH
        FROM ref_date
    )::int AS mes_referencia,
    EXTRACT(
        YEAR
        FROM ref_date
    )::int AS ano_referencia,
    ROUND(
        (
            150 + (
                (seq * 47 + pessoa_id * 13) % 451
            )
        )::numeric,
        2
    ) AS valor_dizimo,
    ROUND(
        (
            75 + (
                (seq * 31 + pessoa_id * 7) % 226
            )
        )::numeric,
        2
    ) AS valor_fundo_comunhao,
    pessoa_id,
    pessoa_id AS solicitante_id,
    (ref_date + INTERVAL '7 day')::timestamp AS data_pagamento,
    'seed-pag-' || pessoa_id || '-' || to_char(ref_date, 'YYYYMM') AS pagamento_id,
    'https://pagamento.teste/devolucao/' || pessoa_id || '/' || to_char(ref_date, 'YYYYMM') AS url_pagamento,
    'SEED-NR-' || pessoa_id || '-' || to_char(ref_date, 'YYYYMM') AS numero_pagamento,
    'SEED-CLI-' || pessoa_id AS codigo_cliente
FROM meses_com_devolucao_23
ORDER BY pessoa_id, ref_date;

COMMIT;

-- Validacao rapida apos o insert.
SELECT
    ano_referencia,
    mes_referencia,
    valor_dizimo,
    valor_fundo_comunhao,
    status
FROM tb_devolucao
WHERE
    pessoa_id = 1
    AND (
        (
            ano_referencia = 2025
            AND mes_referencia >= 4
        )
        OR (
            ano_referencia = 2026
            AND mes_referencia <= 2
        )
    )
ORDER BY ano_referencia, mes_referencia;

SELECT
    pessoa_id,
    ano_referencia,
    mes_referencia,
    valor_dizimo,
    valor_fundo_comunhao,
    status
FROM tb_devolucao
WHERE
    pessoa_id IN (2, 3)
    AND (
        (
            ano_referencia = 2025
            AND mes_referencia >= 4
        )
        OR (
            ano_referencia > 2025
            AND make_date(
                ano_referencia,
                mes_referencia,
                1
            ) <= date_trunc('month', current_date)::date
        )
    )
ORDER BY
    pessoa_id,
    ano_referencia,
    mes_referencia;