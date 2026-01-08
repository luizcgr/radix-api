import { Controller, Get } from '@nestjs/common';
import { map } from 'rxjs';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { ConsultaCelulasService } from 'src/modules/celulas/services/consulta-celulas.service';

@Controller({ path: 'v1/setores' })
export class SetoresController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _consultaCelulasService: ConsultaCelulasService,
  ) {}

  @Roles('setor')
  @Get('minhas-celulas')
  consultarCelulasDoSetor() {
    return this._consultaCelulasService
      .consultar({
        setorId: this._userInfo.pessoa!.celula.setor.id,
      })
      .pipe(
        map((celulas) =>
          celulas.map((celula) => ({ id: celula.id, nome: celula.nome })),
        ),
      );
  }
}
