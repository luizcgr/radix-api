import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, map, Observable } from 'rxjs';
import { Sequelize } from 'sequelize';
import { DATASOURCE } from 'src/constants';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ParametrosRelatorioSetor } from '../types/parametros-relatorio-setor';
import { RelatorioSetor } from '../types/relatorio-setor';

interface QueryResult {
  setor_id: number;
  nome_setor: string;
  nome_missao: string;
  celula_id: number;
  nome_celula: string;
  total_celulas: number;
  total_pessoas: number;
  total_devolucoes: number;
  fidelidade: number;
}

@Injectable()
export class RelatorioSetorService {
  private readonly _logger = new Logger(RelatorioSetorService.name);

  constructor(@Inject(DATASOURCE) private readonly _database: Sequelize) {}

  gerar({
    setorId,
    anoReferencia,
    mesReferencia,
    missaoId,
  }: ParametrosRelatorioSetor): Observable<RelatorioSetor> {
    const incluiMissaoId = !!missaoId;
    return defer(() =>
      this._database.query(this._montarQuery(incluiMissaoId), {
        replacements: {
          setorId,
          anoReferencia,
          mesReferencia,
          missaoId,
        },
      }),
    ).pipe(
      catchSequelizeError('Erro ao gerar relatório de setor', this._logger),
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
          id: setorId,
          nome: typedResults[0]?.['nome_setor'] || '',
          missao: typedResults[0]?.['nome_missao'] || '',
          totalPessoas,
          totalDevolucoes,
          fidelidade,
          celulas: typedResults.map((r) => ({
            id: +r['celula_id'],
            nome: r['nome_celula'],
            totalPessoas: +r['total_pessoas'],
            totalDevolucoes: +r['total_devolucoes'],
            fidelidade: +r['fidelidade'],
          })),
        } as RelatorioSetor;
      }),
    );
  }

  private _montarQuery(incluiMissaoId: boolean = false): string {
    return `
          select
            ts.id as setor_id,
            ts.nome as nome_setor,
            tc.id as celula_id,
            tc.nome as nome_celula,
            tm.nome as nome_missao,
            COUNT(distinct tp.id) as total_pessoas,
            SUM(
                case
                    when td.status = 'pago'
                    and td.ano_referencia = :anoReferencia
                    and td.mes_referencia = :mesReferencia
                    then 1
                    else 0
                end
            ) as total_devolucoes,
            coalesce(
                ROUND(
                    SUM(
                        case
                            when td.status = 'pago'
                            and td.ano_referencia = :anoReferencia
                            and td.mes_referencia = :mesReferencia
                            then 1
                            else 0
                        end
                    )::numeric * 100
                    / nullif(COUNT(distinct tp.id), 0)
                ),
                0
            ) as fidelidade
        from
            tb_setor ts
        left join tb_celula tc
            on
            tc.setor_id = ts.id
        left join tb_pessoa tp
            on
            tp.celula_id = tc.id
        left join tb_devolucao td
            on
            td.pessoa_id = tp.id
            and td.ano_referencia = :anoReferencia
            and td.mes_referencia = :mesReferencia
        left join tb_missao tm
            on
            tm.id = ts.missao_id
        where            
            ts.id = :setorId
            ${incluiMissaoId ? 'and ts.missao_id = :missaoId' : ''}
        group by
            ts.id,
            ts.nome,
            tc.id,
            tc.nome,
            tm.nome
        order by
            ts.nome,
            tc.nome;
        `;
  }
}
