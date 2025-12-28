import { Controller, Get } from '@nestjs/common';
import { PessoasService } from 'src/modules/pessoas/services/pessoas.service';

@Controller({ path: 'v1/pessoas' })
export class PessoasController {
  constructor(private readonly _pessoasService: PessoasService) {}

  @Get()
  consultar() {
    return this._pessoasService.consultar();
  }
}
