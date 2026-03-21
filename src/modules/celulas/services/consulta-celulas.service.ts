import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { CELULA_REPOSITORY } from 'src/constants';
import { CelulaMapper } from 'src/infra/database/mappers/celula.mapper';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { catchSequelizeError } from 'src/utils/custom-error';
import { Celula } from '../types/celula';
import { ConsultaCelulas } from '../types/consulta-celulas';

@Injectable()
export class ConsultaCelulasService {
  private readonly _logger = new Logger(ConsultaCelulasService.name);

  constructor(
    @Inject(CELULA_REPOSITORY)
    private readonly _celulaRepository: typeof CelulaModel,
    private readonly _celulaAdapter: CelulaMapper,
  ) {}

  consultar(consulta: ConsultaCelulas): Observable<Celula[]> {
    return defer(() =>
      this._celulaRepository.findAll({
        where: { ...consulta },
      }),
    ).pipe(
      catchSequelizeError('Erro ao consultar células', this._logger),
      this._celulaAdapter.mapEntityList(),
    );
  }
}
