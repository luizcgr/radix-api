import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, forkJoin, map, Observable } from 'rxjs';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ParametrosRelatorioMissao } from '../types/parametros-relatorio-missao';
import { RelatorioMissao } from '../types/relatorio-missao';
import { RelatorioEvolucaoService } from './relatorio-evolucao.service';

interface QueryResult {
  setor_id: number;
  nome_setor: string;
  nome_missao: string;
  nome_regional: string;
  total_celulas: number;
  total_pessoas: number;
  total_devolucoes: number;
  fidelidade: number;
}

@Injectable()
export class RelatorioMissaoService {
  private readonly _logger = new Logger(RelatorioMissaoService.name);

  constructor(
    @Inject(DATASOURCE) private readonly _database: Sequelize,
    private readonly _relatorioEvolucaoService: RelatorioEvolucaoService,
  ) {}

  gerar(parametros: ParametrosRelatorioMissao): Observable<RelatorioMissao> {
    return forkJoin({
      dadosBasicos: this._consultarDadosBasicosMissao(parametros),
      evolucao: this._relatorioEvolucaoService.gerar(parametros),
    }).pipe(
      map(({ dadosBasicos, evolucao }) => ({
        ...dadosBasicos,
        evolucao,
      })),
    );
  }

  private _consultarDadosBasicosMissao(parametros: ParametrosRelatorioMissao) {
    const { missaoId, anoReferencia, mesReferencia } = parametros;
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
          regional: typedResults[0]?.['nome_regional'] || '',
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
        tr.nome nome_regional,
        COUNT(distinct tc.id) as total_celulas,
        COUNT(distinct tp.id) as total_pessoas,
        COUNT(
          distinct case
            when td.status = 'pago' then tp.id
            else null
          end
        ) as total_devolucoes,
        coalesce(
          ROUND(
            COUNT(
              distinct case
                when td.status = 'pago' then tp.id
                else null
              end
            )::numeric * 100 / nullif(COUNT(distinct tp.id), 0)
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
      left join tb_regional tr on tr.id = tm.regional_id
      where
        ts.missao_id = :missaoId
      group by
        ts.id,
        ts.nome,
        tm.nome,
        tr.nome
      order by
        ts.nome;
    `;
  }
}
