import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { MISSAO_REPOSITORY } from 'src/constants';
import { MissaoModel } from 'src/infra/database/models/missao.model';
import { catchSequelizeError } from 'src/utils/custom-error';
import { ConsultaMissoes } from '../types/consulta-missoes';
import { Missao } from '../types/missao';
import { MissaoMapper } from 'src/infra/database/mappers/missao.mapper';

@Injectable()
export class ConsultaMissoesService {
  private readonly _logger = new Logger(ConsultaMissoesService.name);

  constructor(
    @Inject(MISSAO_REPOSITORY)
    private readonly _missaoRepository: typeof MissaoModel,
    private readonly _missaoMapper: MissaoMapper,
  ) {}

  consultar(consulta: ConsultaMissoes): Observable<Missao[]> {
    return defer(() =>
      this._missaoRepository.findAll({
        where: { ...consulta },
      }),
    ).pipe(
      catchSequelizeError('Erro ao consultar missões', this._logger),
      this._missaoMapper.mapEntityList(),
    );
  }
}
