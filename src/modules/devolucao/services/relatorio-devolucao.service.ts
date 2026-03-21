import { Injectable } from '@nestjs/common';
import { defer, forkJoin, map, Observable } from 'rxjs';
import { ConsultaPessoasService } from 'src/modules/pessoas/services/consulta-pessoas.service';
import { ConsultaDevolucao } from '../types/consulta-devolucao';
import { RelatorioDevolucao } from '../types/relatorio-devolucao';
import { ConsultaDevolucoesService } from './consulta-devolucoes.service';

@Injectable()
export class RelatorioDevolucaoService {
  constructor(
    private readonly _consultaDevolucoesService: ConsultaDevolucoesService,
    private readonly _pessoasService: ConsultaPessoasService,
  ) {}

  gerar(consulta: ConsultaDevolucao): Observable<RelatorioDevolucao> {
    return defer(() =>
      forkJoin({
        devolucoes: this._consultaDevolucoesService.consultar(consulta),
        pessoa: this._pessoasService.consultarPeloId(consulta.pessoaId),
      }),
    ).pipe(
      map(({ devolucoes, pessoa }) => ({
        pessoa: {
          id: pessoa!.id,
          nome: pessoa!.nome,
          celula: pessoa!.celula?.nome || '',
          setor: pessoa!.celula?.setor?.nome || '',
          missao: pessoa!.celula?.setor?.missao?.nome || '',
        },
        devolucoes,
      })),
    );
  }
}
