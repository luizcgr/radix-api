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
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { catchSequelizeError } from 'src/utils/custom-error';
import type { ConsultaPessoas } from '../types/consulta-pessoas';
import { Pessoa } from '../types/pessoa';
import { removeIfEmpty } from 'src/utils/common-utils';

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
      const where: WhereOptions<PessoaModel> = removeIfEmpty({
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
                where: { id: consulta.setorId },
                include: [
                  {
                    as: 'missao',
                    model: MissaoModel,
                    where: { id: consulta.missaoId },
                  },
                ],
              },
            ],
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
