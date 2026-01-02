import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { DEVOLUCAO_REPOSITORY } from 'src/constants';
import { DevolucaoAdapter } from 'src/infra/database/adapters/devolucao.adapter';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { ConsultaDevolucao } from '../types/consulta-devolucao';
import { Devolucao } from '../types/devolucao';

@Injectable()
export class ConsultaDevolucoesService {
  private readonly _logger = new Logger(ConsultaDevolucoesService.name);

  constructor(
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    private readonly _devolucaoAdapter: DevolucaoAdapter,
  ) {}

  consultar(consulta: ConsultaDevolucao): Observable<Devolucao[]> {
    return defer(() =>
      this._devolucaoRepository.findAll({
        where: consulta,
        include: [{ as: 'pessoa', model: PessoaModel }],
        order: [
          ['anoReferencia', 'DESC'],
          ['mesReferencia', 'DESC'],
        ],
      }),
    ).pipe(this._devolucaoAdapter.mapEntityList());
  }
}
