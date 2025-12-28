import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import {
  catchError,
  concatMap,
  defer,
  iif,
  map,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import { Environment } from 'src/infra/environment/environment.service';
import { CustomError } from 'src/utils/custom-error';
import { money } from 'src/utils/formatters';
import { AsaasCustomerResponse } from '../interfaces/asaas-customer-response';
import { AsaasPaymentResponse } from '../interfaces/asaas-payment-response';
import { Cobranca } from '../types/cobranca';
import { FormaPagamento } from '../types/forma-pagamento';
import { LinkPagamento } from '../types/link-pagamento';

@Injectable()
export class CobrancaService {
  private readonly _logger = new Logger(CobrancaService.name);

  constructor(
    private readonly _env: Environment,
    private readonly _http: HttpService,
  ) {}

  gerar(cobranca: Cobranca): Observable<LinkPagamento> {
    return this._consultarClienteNaApiAsaas(cobranca).pipe(
      this._catchErroAoConsultarClienteNaApiAsaas(),
      this._prepararClienteParaGerarCobranca(cobranca),
      this._gerarCobrancaParaCliente(cobranca),
    );
  }

  private _consultarClienteNaApiAsaas(cobranca: Cobranca) {
    return this._http.get(
      `${this._env.asaas.url}/v3/customers?cpfCnpj=${cobranca.cpf}`,
      this._gerarConfiguracaoRequestAsaas(),
    );
  }

  private _gerarHeaders() {
    return {
      'Content-Type': 'application/json',
      accept: 'application/json',
      access_token: this._env.asaas.token,
    };
  }

  private _gerarCobrancaParaCliente(
    cobranca: Cobranca,
  ): OperatorFunction<AsaasCustomerResponse, LinkPagamento> {
    return concatMap((customer) =>
      this._http
        .post<LinkPagamento>(
          `${this._env.asaas.url}/v3/payments`,
          this._gerarPayloadCobranca(cobranca, customer),
          this._gerarConfiguracaoRequestAsaas(),
        )
        .pipe(
          this._catchErroAoGerarCobrancaNaApiAsaas(),
          map((response: AxiosResponse) => {
            const data = response.data as AsaasPaymentResponse;
            const linkPagamento: LinkPagamento = {
              invoiceUrl: data.invoiceUrl,
              invoiceNumber: data.invoiceNumber,
              customer: data.customer,
              paymentId: data.id,
            };
            return linkPagamento;
          }),
        ),
    );
  }

  private _gerarConfiguracaoRequestAsaas() {
    return {
      headers: this._gerarHeaders(),
    };
  }

  private _gerarPayloadCobranca(
    cobranca: Cobranca,
    customer: AsaasCustomerResponse,
  ): any {
    return {
      name: 'Comunhão de bens',
      endDate: moment().add(2, 'days').format('YYYY-MM-DD'),
      value: cobranca.valor,
      billingType: this._definirBillingType(cobranca.formaPagamento),
      chargeType: 'DETACHED',
      description: `Pagamento via ${cobranca.formaPagamento} no valor de ${money(cobranca.valor)}`,
      customer: customer.id,
    };
  }

  private _catchErroAoGerarCobrancaNaApiAsaas(): OperatorFunction<
    AxiosResponse<LinkPagamento>,
    AxiosResponse<LinkPagamento>
  > {
    return catchError((error: AxiosError) => {
      this._logger.error(
        'Erro ao gerar cobrança Asaas:',
        error.response?.data || error.message,
      );
      return throwError(
        () => new CustomError('Erro ao gerar cobrança Asaas', 500),
      );
    });
  }

  private _prepararClienteParaGerarCobranca(cobranca: Cobranca) {
    return concatMap((response: AxiosResponse) => {
      const clientesEncontrados = response.data as AsaasCustomerResponse[];
      const utilizarClienteExistente$ = defer(() => of(clientesEncontrados[0]));
      const criarNovoCliente$ = this._criarNovoClienteNaApiAsaas(cobranca);
      return iif(
        () => clientesEncontrados.length > 0,
        utilizarClienteExistente$,
        criarNovoCliente$,
      );
    });
  }

  _criarNovoClienteNaApiAsaas(
    cobranca: Cobranca,
  ): Observable<AsaasCustomerResponse> {
    return this._http
      .post<AsaasCustomerResponse>(
        `${this._env.asaas.url}/v3/customers`,
        this._gerarPayloadCriacaoNovoUsuario(cobranca),
        this._gerarConfiguracaoRequestAsaas(),
      )
      .pipe(
        map((response: AxiosResponse<AsaasCustomerResponse>) =>
          this._toCustomer(response.data),
        ),
      );
  }

  private _gerarPayloadCriacaoNovoUsuario(cobranca: Cobranca): any {
    return {
      name: cobranca.nome,
      cpfCnpj: cobranca.cpf,
    };
  }

  private _toCustomer(payload: unknown): AsaasCustomerResponse {
    const data = payload as AsaasCustomerResponse[];
    const customer: AsaasCustomerResponse = {
      id: data[0].id,
      name: data[0].name,
      email: data[0].email,
      cpfCnpj: data[0].cpfCnpj,
    };
    return customer;
  }

  private _catchErroAoConsultarClienteNaApiAsaas() {
    return catchError((error: AxiosError) =>
      throwError(() => {
        this._logger.error(
          'Erro ao buscar cliente Asaas:',
          error.response?.data || error.message,
        );
        return throwError(
          () => new CustomError('Erro ao buscar cliente Asaas', 500),
        );
      }),
    );
  }

  private _definirBillingType(formaPagamento: FormaPagamento): string {
    if (formaPagamento === 'CARTAO_CREDITO') {
      return 'CREDIT_CARD';
    }
    return 'PIX';
  }
}
