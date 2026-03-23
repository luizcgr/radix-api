import { Inject, Injectable, Logger } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { IncludeOptions } from 'sequelize';
import { CELULA_REPOSITORY } from 'src/constants';
import { CelulaMapper } from 'src/infra/database/mappers/celula.mapper';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
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

  consultarPeloId(celulaId: number): Observable<Celula | null> {
    return defer(() =>
      this._celulaRepository.findByPk(celulaId, {
        include: this._montarIncludes(),
      }),
    ).pipe(
      catchSequelizeError('Erro ao consultar célula pelo ID', this._logger),
      this._celulaAdapter.mapEntity(),
    );
  }

  consultar(consulta: ConsultaCelulas): Observable<Celula[]> {
    return defer(() =>
      this._celulaRepository.findAll({
        where: { ...consulta },
        include: this._montarIncludes(),
      }),
    ).pipe(
      catchSequelizeError('Erro ao consultar células', this._logger),
      this._celulaAdapter.mapEntityList(),
    );
  }

  private _montarIncludes(): IncludeOptions[] {
    return [
      {
        as: 'setor',
        model: SetorModel,
        include: [{ as: 'missao', model: MissaoModel }],
      },
    ];
  }
}
