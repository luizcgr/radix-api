import { Inject, Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DATABASE } from 'src/constants';
import { ParametrosRelatorioCelula } from '../types/parametros-relatorio-celula';
import { catchError, defer, map, Observable, throwError } from 'rxjs';
import { RelatorioCelula } from '../types/relatorio-celula';
import { CustomError } from 'src/utils/custom-error';

interface QueryResult {
  id: number;
  nome: string;
  celula: string;
  fez_devolucao: boolean;
}

@Injectable()
export class RelatorioCelulaService {
  private readonly _logger = new Logger(RelatorioCelulaService.name);

  constructor(@Inject(DATABASE) private readonly _database: Sequelize) {}

  gerar({
    celulaId,
    mesReferencia,
    anoReferencia,
  }: ParametrosRelatorioCelula): Observable<RelatorioCelula | null> {
    return defer(() =>
      this._database.query(this._montarQuery(), {
        replacements: { celulaId, mesReferencia, anoReferencia },
      }),
    ).pipe(
      catchError(() => {
        this._logger.error(
          `Erro ao gerar relatório de célula para célulaId=${celulaId}, mesReferencia=${mesReferencia}, anoReferencia=${anoReferencia}`,
        );
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
          nome: typedResults[0]['celula'],
          totalDevolucoes,
          totalPessoas,
          fidelidade,
          pessoas: typedResults.map((r) => ({
            id: r['id'],
            nome: r['nome'],
            devolucao: r['fez_devolucao'],
          })),
        } as RelatorioCelula;
      }),
    );
  }

  private _montarQuery(): string {
    return `
      select
        tp.id,
        tp.nome ,
        tc.nome celula,
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
      left join tb_celula tc on tc.id = tp.celula_id 
      where
        tp.celula_id = :celulaId
      order by
        tp.nome asc;
    `;
  }
}
