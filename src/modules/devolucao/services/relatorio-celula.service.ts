import { Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, defer, forkJoin, map, Observable, throwError } from 'rxjs';
import { BaseError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { CustomError } from 'src/utils/custom-error';
import { ParametrosRelatorioCelula } from '../types/parametros-relatorio-celula';
import {
  DadosBasicosRelatorioCelula,
  RelatorioCelula,
} from '../types/relatorio-celula';
import { RelatorioEvolucaoService } from './relatorio-evolucao.service';

interface DadosBasicosQueryResult {
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

  constructor(
    @Inject(DATASOURCE) private readonly _database: Sequelize,
    private readonly _relatorioEvolucaoService: RelatorioEvolucaoService,
  ) {}

  gerar(
    parametros: ParametrosRelatorioCelula,
  ): Observable<RelatorioCelula | null> {
    return forkJoin({
      dadosBasicos: this._consultarDadosBasicos(parametros),
      evolucao: this._relatorioEvolucaoService.gerar(parametros),
    }).pipe(
      map(({ dadosBasicos, evolucao }) => {
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
          evolucao,
        };
        return relatorio;
      }),
    );
  }

  private _consultarDadosBasicos(
    parametros: ParametrosRelatorioCelula,
  ): Observable<DadosBasicosRelatorioCelula | null> {
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
        exists (
          select 1
          from tb_devolucao td
          where
            td.pessoa_id = tp.id
            and td.status = 'pago'
            and td.ano_referencia = :anoReferencia
            and td.mes_referencia = :mesReferencia
        ) as fez_devolucao
      from
        tb_pessoa tp
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
