import { Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, defer, forkJoin, map, Observable, throwError } from 'rxjs';
import { BaseError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { CustomError } from 'src/utils/custom-error';
import { ItemEvolucao } from '../types/item-evolucao';
import { ParametrosRelatorioEvolucao } from '../types/parametros-relatorio-evolucao';
import { RelatorioEvolucao } from '../types/relatorio-evolucao';

interface EvolucaoQueryResult {
  mes: string;
  mes_formatado: string;
  valor: number;
}

@Injectable()
export class RelatorioEvolucaoService {
  private readonly _logger = new Logger(RelatorioEvolucaoService.name);

  constructor(@Inject(DATASOURCE) private readonly _database: Sequelize) {}

  gerar(
    parametros: ParametrosRelatorioEvolucao,
  ): Observable<RelatorioEvolucao> {
    return defer(() =>
      forkJoin({
        quantidades: this.consultarEvolucaoQuantidades(parametros),
        valores: this.consultarEvolucaoValores(parametros),
      }),
    );
  }

  private consultarEvolucaoQuantidades(
    parametros: ParametrosRelatorioEvolucao,
  ): Observable<ItemEvolucao[]> {
    return this.consultarEvolucao(
      parametros,
      this._montarQueryEvolucaoQuantidades(parametros),
    );
  }

  private consultarEvolucaoValores(
    parametros: ParametrosRelatorioEvolucao,
  ): Observable<ItemEvolucao[]> {
    return this.consultarEvolucao(
      parametros,
      this.montarQueryEvolucaoValores(parametros),
    );
  }

  private consultarEvolucao(
    parametros: ParametrosRelatorioEvolucao,
    sql: string,
  ): Observable<ItemEvolucao[]> {
    return defer(() =>
      this._database.query(sql, {
        replacements: {
          celulaId: 'celulaId' in parametros ? parametros.celulaId : undefined,
          setorId: 'setorId' in parametros ? parametros.setorId : undefined,
          missaoId: 'missaoId' in parametros ? parametros.missaoId : undefined,
        },
      }),
    ).pipe(
      catchError((error: BaseError) => {
        this._logger.error(`Erro ao consultar evolução`);
        this._logger.error(error);
        return throwError(
          () =>
            new CustomError('Erro ao consultar evolução de quantidades', 500),
        );
      }),
      map(([results]) => {
        const typedResults = results as EvolucaoQueryResult[];
        return typedResults.map((r) => {
          const item: ItemEvolucao = {
            mes: r['mes'] ?? '',
            mesFormatado: r['mes_formatado'] ?? '',
            valor: +r['valor'],
          };
          return item;
        });
      }),
    );
  }

  private _montarQueryEvolucaoQuantidades(
    parametros: ParametrosRelatorioEvolucao,
  ): string {
    return `
    WITH
      meses AS (
          SELECT DATE_TRUNC(
                  'month', CURRENT_DATE - INTERVAL '1 month' * s.num
              ) AS data_mes
          FROM GENERATE_SERIES(0, 11) AS s (num)
      )
    SELECT
        TO_CHAR(m.data_mes, 'YYYY-MM') AS mes,
        TO_CHAR(m.data_mes, 'MM/YYYY') AS mes_formatado,
        COALESCE(
          COUNT(
            DISTINCT CASE
              WHEN d.status = 'pago'
              ${'celulaId' in parametros ? 'and tp.id is not null' : ''}
              ${'setorId' in parametros ? 'and tc.id is not null' : ''}
              ${'missaoId' in parametros ? 'and ts.id is not null' : ''}
              THEN d.pessoa_id
              ELSE NULL
            END
          ),
          0
        ) AS valor
   FROM meses m
        LEFT JOIN tb_devolucao d ON DATE_TRUNC('month', d.data_pagamento) = m.data_mes
        AND d.data_pagamento IS NOT NULL
        left join tb_pessoa tp on tp.id = d.pessoa_id ${'celulaId' in parametros ? 'and tp.celula_id = :celulaId' : ''}   
        left join tb_celula tc on tc.id = tp.celula_id ${'setorId' in parametros ? 'and tc.setor_id = :setorId' : ''}
        left join tb_setor ts on ts.id = tc.setor_id ${'missaoId' in parametros ? 'and ts.missao_id = :missaoId' : ''}
        left join tb_missao tm on tm.id = ts.missao_id        
    GROUP BY
        m.data_mes
    ORDER BY m.data_mes ASC;     
    `;
  }

  private montarQueryEvolucaoValores(
    parametros: ParametrosRelatorioEvolucao,
  ): string {
    return `
    WITH
      meses AS (
          SELECT DATE_TRUNC(
                  'month', CURRENT_DATE - INTERVAL '1 month' * s.num
              ) AS data_mes
          FROM GENERATE_SERIES(0, 11) AS s (num)
      )
    SELECT
        TO_CHAR(m.data_mes, 'YYYY-MM') AS mes,
        TO_CHAR(m.data_mes, 'MM/YYYY') AS mes_formatado,
        COALESCE(
          SUM(
            CASE
              WHEN d.status = 'pago'
              ${'celulaId' in parametros ? 'and tp.id is not null' : ''}
              ${'setorId' in parametros ? 'and tc.id is not null' : ''}
              ${'missaoId' in parametros ? 'and ts.id is not null' : ''}
              THEN d.valor_dizimo
              ELSE 0
            END
          ),
          0
        ) AS valor
    FROM meses m
        LEFT JOIN tb_devolucao d ON DATE_TRUNC('month', d.data_pagamento) = m.data_mes
        AND d.data_pagamento IS NOT NULL
        left join tb_pessoa tp on tp.id = d.pessoa_id ${'celulaId' in parametros ? 'and tp.celula_id = :celulaId' : ''}   
        left join tb_celula tc on tc.id = tp.celula_id ${'setorId' in parametros ? 'and tc.setor_id = :setorId' : ''}
        left join tb_setor ts on ts.id = tc.setor_id ${'missaoId' in parametros ? 'and ts.missao_id = :missaoId' : ''}
        left join tb_missao tm on tm.id = ts.missao_id        
    GROUP BY
        m.data_mes
    ORDER BY m.data_mes ASC;    
    `;
  }
}
