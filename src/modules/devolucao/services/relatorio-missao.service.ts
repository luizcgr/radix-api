import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, map, Observable } from 'rxjs';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ParametrosRelatorioMissao } from '../types/parametros-relatorio-missao';
import { RelatorioMissao } from '../types/relatorio-missao';

interface QueryResult {
  setor_id: number;
  nome_setor: string;
  nome_missao: string;
  total_celulas: number;
  total_pessoas: number;
  total_devolucoes: number;
  fidelidade: number;
}

@Injectable()
export class RelatorioMissaoService {
  private readonly _logger = new Logger(RelatorioMissaoService.name);

  constructor(@Inject(DATASOURCE) private readonly _database: Sequelize) {}

  gerar({
    missaoId,
    anoReferencia,
    mesReferencia,
  }: ParametrosRelatorioMissao): Observable<RelatorioMissao> {
    return defer(() =>
      this._database.query(this._montarQuery(), {
        replacements: {
          missaoId,
          anoReferencia,
          mesReferencia,
        },
      }),
    ).pipe(
      catchSequelizeError('Erro ao gerar relatório de missão', this._logger),
      map(([results]) => {
        const typedResults = results as QueryResult[];
        const totalPessoas = typedResults.reduce(
          (acc, curr) => acc + Number(curr['total_pessoas']),
          0,
        );
        const totalDevolucoes = typedResults.reduce(
          (acc, curr) => acc + Number(curr['total_devolucoes']),
          0,
        );
        const fidelidade = Math.round((totalDevolucoes / totalPessoas) * 100);
        return {
          anoReferencia,
          mesReferencia,
          id: missaoId,
          nome: typedResults[0]?.['nome_missao'] || '',
          totalPessoas,
          totalDevolucoes,
          fidelidade,
          setores: typedResults.map((r) => ({
            id: +r['setor_id'],
            nome: r['nome_setor'],
            totalCelulas: +r['total_celulas'],
            totalPessoas: +r['total_pessoas'],
            totalDevolucoes: +r['total_devolucoes'],
            fidelidade: +r['fidelidade'],
          })),
        };
      }),
    );
  }

  private _montarQuery(): string {
    return `
      select
        ts.id setor_id,
        ts.nome nome_setor,
        tm.nome nome_missao,
        COUNT(distinct tc.id) as total_celulas,
        COUNT(distinct tp.id) as total_pessoas,
        SUM(case when td.status = 'pago' and td.ano_referencia = 2026 and td.mes_referencia = 1 then 1 else 0 end) as total_devolucoes,
        coalesce(
          ROUND(
            SUM(
                case when td.status = 'pago' and td.ano_referencia = :anoReferencia and td.mes_referencia = :mesReferencia then 1 else 0 end)::numeric * 100 / nullif(COUNT(distinct tp.id)
            , 0)
          )
        , 0) as fidelidade
      from
        tb_setor ts
      left join tb_celula tc on
        tc.setor_id = ts.id
      left join tb_pessoa tp on
        tp.celula_id = tc.id
      left join tb_devolucao td on
        td.pessoa_id = tp.id
        and td.ano_referencia = :anoReferencia
        and td.mes_referencia = :mesReferencia
      left join tb_missao tm on 
	    tm.id = ts.missao_id
      where
        ts.missao_id = :missaoId
      group by
        ts.id,
        ts.nome,
        tm.nome
      order by
        ts.nome;
    `;
  }
}
