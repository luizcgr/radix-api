import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'v1/pessoas' })
export class PessoasController {
  @Get()
  heath() {
    return { status: 'ok' };
  }
}
