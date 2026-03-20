import { Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, defer, forkJoin, map, Observable, throwError } from 'rxjs';
import { BaseError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { CustomError } from 'src/utils/custom-error';
import { ItemEvolucao } from '../types/item-evolucao';
import { ParametrosRelatorioCelula } from '../types/parametros-relatorio-celula';
import {
  DadosBasicosRelatorio,
  RelatorioCelula,
} from '../types/relatorio-celula';

interface DadosBasicosQueryResult {
  id: number;
  nome: string;
  celula: string;
  setor: string;
  missao: string;
  fez_devolucao: boolean;
}

interface EvolucaoQueryResult {
  mes: string;
  mes_formatado: string;
  valor: number;
}

@Injectable()
export class RelatorioCelulaService {
  private readonly _logger = new Logger(RelatorioCelulaService.name);

  constructor(@Inject(DATASOURCE) private readonly _database: Sequelize) {}

  gerar(
    parametros: ParametrosRelatorioCelula,
  ): Observable<RelatorioCelula | null> {
    return forkJoin({
      dadosBasicos: this._consultarDadosBasicos(parametros),
      evolucaoQuantidades: this.consultarEvolucaoQuantidades(parametros),
      evolucaoValores: this.consultarEvolucaoValores(parametros),
    }).pipe(
      map(({ dadosBasicos, evolucaoQuantidades, evolucaoValores }) => {
        if (!dadosBasicos) {
          return null;
        }
        const relatorio: RelatorioCelula = {
          celula: dadosBasicos.celula,
          setor: dadosBasicos.setor,
          missao: dadosBasicos.missao,
          anoReferencia: dadosBasicos.anoReferencia,
          mesReferencia: dadosBasicos.mesReferencia,
          totalDevolucoes: dadosBasicos.totalDevolucoes,
          totalPessoas: dadosBasicos.totalPessoas,
          fidelidade: dadosBasicos.fidelidade,
          pessoas: dadosBasicos.pessoas,
          evolucao: {
            quantidades: evolucaoQuantidades,
            valores: evolucaoValores,
          },
        };
        return relatorio;
      }),
    );
  }

  private consultarEvolucaoQuantidades(
    parametros: ParametrosRelatorioCelula,
  ): Observable<ItemEvolucao[]> {
    const { setorId, missaoId } = parametros;
    const incluiSetorId = !!setorId;
    const incluiMissaoId = !!missaoId;
    return this.consultarEvolucao(
      parametros,
      this._montarQueryEvolucaoQuantidades(incluiSetorId, incluiMissaoId),
    );
  }

  private consultarEvolucaoValores(
    parametros: ParametrosRelatorioCelula,
  ): Observable<ItemEvolucao[]> {
    const { setorId, missaoId } = parametros;
    const incluiSetorId = !!setorId;
    const incluiMissaoId = !!missaoId;
    return this.consultarEvolucao(
      parametros,
      this.montarQueryEvolucaoValores(incluiSetorId, incluiMissaoId),
    );
  }

  private consultarEvolucao(
    parametros: ParametrosRelatorioCelula,
    sql: string,
  ): Observable<ItemEvolucao[]> {
    const { setorId, celulaId, mesReferencia, anoReferencia } = parametros;
    return defer(() =>
      this._database.query(sql, {
        replacements: {
          celulaId,
          mesReferencia,
          anoReferencia,
          setorId: !setorId ? undefined : setorId,
        },
      }),
    ).pipe(
      catchError((error: BaseError) => {
        this._logger.error(
          `Erro ao consultar evolução de quantidades para célulaId=${celulaId}, mesReferencia=${mesReferencia}, anoReferencia=${anoReferencia}`,
        );
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

  private _consultarDadosBasicos(
    parametros: ParametrosRelatorioCelula,
  ): Observable<DadosBasicosRelatorio | null> {
    const { setorId, missaoId, celulaId, mesReferencia, anoReferencia } =
      parametros;
    const incluiSetorId = !!setorId;
    const incluiMissaoId = !!missaoId;
    return defer(() =>
      this._database.query(
        this._montarQueryDadosBasicos(incluiSetorId, incluiMissaoId),
        {
          replacements: {
            celulaId,
            mesReferencia,
            anoReferencia,
            setorId: !setorId ? undefined : setorId,
          },
        },
      ),
    ).pipe(
      catchError((error: BaseError) => {
        this._logger.error(
          `Erro ao gerar relatório de célula para célulaId=${celulaId}, mesReferencia=${mesReferencia}, anoReferencia=${anoReferencia}`,
        );
        this._logger.error(error);
        return throwError(
          () => new CustomError('Erro ao gerar relatório de célula', 500),
        );
      }),
      map(([results]) => {
        if (results.length === 0) {
          return null;
        }
        const typedResults = results as DadosBasicosQueryResult[];
        const totalPessoas = typedResults.length;
        const totalDevolucoes = typedResults.filter(
          (r) => r['fez_devolucao'],
        ).length;
        const fidelidade = Math.round((totalDevolucoes / totalPessoas) * 100);
        return {
          anoReferencia,
          mesReferencia,
          celula: typedResults[0]['celula'],
          setor: typedResults[0]['setor'],
          missao: typedResults[0]['missao'],
          totalDevolucoes,
          totalPessoas,
          fidelidade,
          pessoas: typedResults.map((r) => ({
            id: r['id'],
            nome: r['nome'],
            devolucao: r['fez_devolucao'],
          })),
        };
      }),
    );
  }

  private _montarQueryDadosBasicos(
    incluiSetor: boolean,
    incluiMissao: boolean,
  ): string {
    return `
      select
        tp.id,
        tp.nome ,
        tc.nome celula,
        ts.nome setor,
        tm.nome missao,
        case
          when td.status = 'pago' then true
          else false
        end as fez_devolucao
      from
        tb_pessoa tp
      left join tb_devolucao td
          on
        td.pessoa_id = tp.id
        and td.status = 'pago'
        and td.ano_referencia = :anoReferencia
        and td.mes_referencia = :mesReferencia
      left join tb_celula tc on tp.celula_id = tc.id
      left join tb_setor ts on tc.setor_id = ts.id 
      left join tb_missao tm on ts.missao_id = tm.id       
      where
        tp.celula_id = :celulaId
        ${incluiSetor ? 'and ts.id = :setorId' : ''}
        ${incluiMissao ? 'and tm.id = :missaoId' : ''}
      order by
        tp.nome asc;
    `;
  }

  private _montarQueryEvolucaoQuantidades(
    incluiSetor: boolean,
    incluiMissao: boolean,
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
        COALESCE(COUNT(d.id), 0) AS valor
   FROM meses m
        LEFT JOIN tb_devolucao d ON DATE_TRUNC('month', d.data_pagamento) = m.data_mes
        AND d.data_pagamento IS NOT NULL
        left join tb_pessoa tp on tp.id = d.pessoa_id and tp.celula_id = :celulaId
        left join tb_celula tc on tc.id = tp.celula_id ${incluiSetor ? 'and tc.setor_id = :setorId' : ''}
        left join tb_setor ts on ts.id = tc.setor_id ${incluiMissao ? 'and ts.missao_id = :missaoId' : ''}
        left join tb_missao tm on tm.id = ts.missao_id        
    GROUP BY
        m.data_mes
    ORDER BY m.data_mes ASC;     
    `;
  }

  public montarQueryEvolucaoValores(
    incluiSetor: boolean,
    incluiMissao: boolean,
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
        COALESCE(SUM(d.valor_dizimo), 0) AS valor
    FROM meses m
        LEFT JOIN tb_devolucao d ON DATE_TRUNC('month', d.data_pagamento) = m.data_mes
        AND d.data_pagamento IS NOT NULL
        left join tb_pessoa tp on tp.id = d.pessoa_id and tp.celula_id = :celulaId
        left join tb_celula tc on tc.id = tp.celula_id ${incluiSetor ? 'and tc.setor_id = :setorId' : ''}
        left join tb_setor ts on ts.id = tc.setor_id ${incluiMissao ? 'and ts.missao_id = :missaoId' : ''}
        left join tb_missao tm on tm.id = ts.missao_id        
    GROUP BY
        m.data_mes
    ORDER BY m.data_mes ASC;    
    `;
  }
}
