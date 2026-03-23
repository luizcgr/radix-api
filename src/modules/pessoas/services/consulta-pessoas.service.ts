import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { Op, WhereOptions } from 'sequelize';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PessoaMapper } from 'src/infra/database/mappers/pessoa.mapper';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';
import { PermissaoModel } from 'src/infra/database/models/permissao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { removeIfEmpty } from 'src/utils/common-utils';
import { catchSequelizeError } from 'src/utils/custom-error';
import type { ConsultaPessoas } from '../types/consulta-pessoas';
import { Pessoa } from '../types/pessoa';

@Injectable()
export class ConsultaPessoasService {
  private readonly _logger = new Logger(ConsultaPessoasService.name);

  constructor(
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaRepository: typeof PessoaModel,
    private readonly _pessoaAdapter: PessoaMapper,
  ) {}

  @TransactionObserver()
  consultar(consulta: ConsultaPessoas): Observable<Pessoa[]> {
    this._testarParametrosDeConsulta(consulta);
    return defer(async () => {
      const setorWhere = removeIfEmpty({ id: consulta.setorId });
      const missaoWhere = removeIfEmpty({ id: consulta.missaoId });
      const where: WhereOptions<PessoaModel> = removeIfEmpty({
        id: consulta.id,
        cpf: consulta.cpf,
        nome:
          consulta.nome && consulta.nome.trim().length > 0
            ? { [Op.iLike]: `%${consulta.nome}%` }
            : undefined,
        celulaId: consulta.celulaId,
      });
      const models = await this._pessoaRepository.findAll({
        where,
        include: [
          {
            as: 'celula',
            model: CelulaModel,
            required: true,
            include: [
              {
                as: 'setor',
                model: SetorModel,
                ...(Object.keys(setorWhere).length > 0
                  ? { where: setorWhere }
                  : {}),
                include: [
                  {
                    as: 'missao',
                    model: MissaoModel,
                    ...(Object.keys(missaoWhere).length > 0
                      ? { where: missaoWhere }
                      : {}),
                  },
                ],
              },
            ],
          },
          {
            as: 'permissao',
            model: PermissaoModel,
          },
        ],
      });
      return models;
    }).pipe(
      catchSequelizeError('Erro ao consultar pessoas', this._logger),
      this._pessoaAdapter.mapEntityList(),
    );
  }

  private _testarParametrosDeConsulta(consulta: ConsultaPessoas) {
    const paramsCount = Object.keys(
      removeIfEmpty({ ...consulta }, true, true),
    ).length;
    if (paramsCount === 0) {
      throw new BadRequestException(
        'É necessário informar ao menos um parâmetro de consulta',
      );
    }
  }

  consultarPeloId(pessoaId: number): Observable<Pessoa | null> {
    return defer(() =>
      this._pessoaRepository.findByPk(pessoaId, {
        include: [
          {
            as: 'celula',
            model: CelulaModel,
            include: [
              {
                as: 'setor',
                model: SetorModel,
                include: [{ as: 'missao', model: MissaoModel }],
              },
            ],
          },
        ],
      }),
    ).pipe(this._pessoaAdapter.mapEntity());
  }
}
