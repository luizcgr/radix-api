import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { CadastroPessoasService } from 'src/modules/pessoas/services/cadastro-pessoas.service';
import { CadastroPessoaDto } from './cadastro-pessoa.dto';

@Controller({ path: 'v1/pessoas' })
export class PessoaController {
  constructor(
    private readonly _cadastroPessoasService: CadastroPessoasService,
  ) {}

  @Roles('admin')
  @Post()
  inserir(@Body() body: CadastroPessoaDto) {
    return this._cadastroPessoasService.salvar(body);
  }

  @Roles('admin')
  @Put(':pessoaId')
  alterar(
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Body() body: CadastroPessoaDto,
  ) {
    return this._cadastroPessoasService.salvar({ ...body, id: pessoaId });
  }
}
