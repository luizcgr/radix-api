import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, forkJoin, map, Observable } from 'rxjs';
import { Sequelize } from 'sequelize-typescript';
import { DATASOURCE } from 'src/constants';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ParametrosRelatorioRegional } from '../types/parametros-relatorio-regional';
import { RelatorioRegional } from '../types/relatorio-regional';
import { RelatorioEvolucaoService } from './relatorio-evolucao.service';

interface QueryResult {
  missao_id: number;
  nome_missao: string;
  nome_regional: string;
  total_setores: number;
  total_celulas: number;
  total_pessoas: number;
  total_devolucoes: number;
  fidelidade: number;
}

@Injectable()
export class RelatorioRegionalService {
  private readonly _logger = new Logger(RelatorioRegionalService.name);

  constructor(
    @Inject(DATASOURCE) private readonly _database: Sequelize,
    private readonly _relatorioEvolucaoService: RelatorioEvolucaoService,
  ) {}

  gerar(
    parametros: ParametrosRelatorioRegional,
  ): Observable<RelatorioRegional> {
    // Para o relatório de evolução, é necessário passar um parâmetro com missaoId
    const parametrosEvolucao = {
      mesReferencia: parametros.mesReferencia,
      anoReferencia: parametros.anoReferencia,
      missaoId: parametros.regionalId, // Ajuste conforme a lógica de negócio, se necessário
    };
    return forkJoin({
      dadosBasicos: this._consultarDadosBasicosRegional(parametros),
      evolucao: this._relatorioEvolucaoService.gerar(parametrosEvolucao),
    }).pipe(
      map(({ dadosBasicos, evolucao }) => ({
        ...dadosBasicos,
        evolucao,
      })),
    );
  }

  private _consultarDadosBasicosRegional(
    parametros: ParametrosRelatorioRegional,
  ) {
    const { regionalId, anoReferencia, mesReferencia } = parametros;
    return defer(() =>
      this._database.query(this._montarQuery(), {
        replacements: {
          regionalId,
          anoReferencia,
          mesReferencia,
        },
      }),
    ).pipe(
      catchSequelizeError('Erro ao gerar relatório de regional', this._logger),
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
          id: regionalId,
          nome: typedResults[0]?.['nome_regional'] || '',
          totalPessoas,
          totalDevolucoes,
          fidelidade,
          missoes: typedResults.map((r) => ({
            id: +r['missao_id'],
            nome: r['nome_missao'],
            totalSetores: +r['total_setores'],
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
        tm.id as missao_id,
        tm.nome as nome_missao,
        tr.nome as nome_regional,
        COUNT(distinct ts.id) as total_setores,
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
        tb_regional tr
      left join tb_missao tm on
        tm.regional_id = tr.id
      left join tb_setor ts on
        ts.missao_id = tm.id
      left join tb_celula tc on
        tc.setor_id = ts.id
      left join tb_pessoa tp on
        tp.celula_id = tc.id
      left join tb_devolucao td on
        td.pessoa_id = tp.id
        and td.ano_referencia = :anoReferencia
        and td.mes_referencia = :mesReferencia
      where
        tr.id = :regionalId
      group by
        tm.id,
        tm.nome,
        tr.nome
      order by
        tm.nome;
    `;
  }
}
