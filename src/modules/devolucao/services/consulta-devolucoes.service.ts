import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { WhereOptions } from 'sequelize';
import { DEVOLUCAO_REPOSITORY } from 'src/constants';
import { DevolucaoAdapter } from 'src/infra/database/adapters/devolucao.adapter';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ConsultaDevolucao } from '../types/consulta-devolucao';
import { Devolucao } from '../types/devolucao';
import { removerUndefined } from 'src/utils/common-utils';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { CelulaModel } from 'src/infra/database/models/celula.model';

@Injectable()
export class ConsultaDevolucoesService {
  private readonly _logger = new Logger(ConsultaDevolucoesService.name);

  constructor(
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    private readonly _devolucaoAdapter: DevolucaoAdapter,
  ) {}

  consultar(consulta: ConsultaDevolucao): Observable<Devolucao[]> {
    const devolucaoWhere: WhereOptions<DevolucaoModel> = removerUndefined({
      anoReferencia: consulta.anoReferencia,
      mesReferencia: consulta.mesReferencia,
      status: consulta.status,
    });
    const pessoaWhere: WhereOptions<PessoaModel> = removerUndefined({
      id: consulta.pessoaId,
      celulaId: consulta.celulaId,
    });
    const celulaWhere: WhereOptions<SetorModel> = removerUndefined({
      setorId: consulta.setorId,
    });
    const setorWhere: WhereOptions<SetorModel> = removerUndefined({
      missaoId: consulta.missaoId,
    });

    if (Object.keys(celulaWhere).length) {
      pessoaWhere['$setor$'] = celulaWhere;
    }
    return defer(() =>
      this._devolucaoRepository.findAll({
        where: devolucaoWhere,
        include: [
          {
            as: 'pessoa',
            model: PessoaModel,
            where: pessoaWhere,
            include: [
              {
                as: 'celula',
                model: CelulaModel,
                where: celulaWhere,
                include: [
                  { as: 'setor', model: SetorModel, where: setorWhere },
                ],
              },
            ],
          },
        ],
        order: [
          ['anoReferencia', 'DESC'],
          ['mesReferencia', 'DESC'],
        ],
      }),
    ).pipe(
      catchSequelizeError(
        'Ocorreu um erro ao executar a consulta de devoluções',
        this._logger,
      ),
      this._devolucaoAdapter.mapEntityList(),
    );
  }
}
