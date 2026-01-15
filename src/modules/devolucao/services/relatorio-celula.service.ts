import { Inject, Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { ParametrosRelatorioCelula } from '../types/parametros-relatorio-celula';
import { catchError, defer, map, Observable, throwError } from 'rxjs';
import { RelatorioCelula } from '../types/relatorio-celula';
import { CustomError } from 'src/utils/custom-error';
import { BaseError } from 'sequelize';

interface QueryResult {
  id: number;
  nome: string;
  celula: string;
  setor: string;
  missao: string;
  fez_devolucao: boolean;
}

@Injectable()
export class RelatorioCelulaService {
  private readonly _logger = new Logger(RelatorioCelulaService.name);

  constructor(@Inject(DATASOURCE) private readonly _database: Sequelize) {}

  gerar({
    celulaId,
    mesReferencia,
    anoReferencia,
    setorId,
    missaoId,
  }: ParametrosRelatorioCelula): Observable<RelatorioCelula | null> {
    const incluiSetorId = !!setorId;
    const incluiMissaoId = !!missaoId;
    return defer(() =>
      this._database.query(this._montarQuery(incluiSetorId, incluiMissaoId), {
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
        const typedResults = results as QueryResult[];
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

  private _montarQuery(incluiSetor: boolean, incluiMissao: boolean): string {
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
}
