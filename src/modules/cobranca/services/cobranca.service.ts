import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import moment from 'moment';
import {
  concatMap,
  defer,
  iif,
  map,
  Observable,
  of,
  OperatorFunction,
} from 'rxjs';
import { Environment } from 'src/infra/environment/environment.service';
import { catchHttpErrorResponse } from 'src/utils/custom-error';
import { money } from 'src/utils/formatters';
import { AsaasCustomerResponse } from '../interfaces/asaas-customer-response';
import { AsaasCustomersListResponse } from '../interfaces/asaas-customers-list-response';
import { AsaasPaymentResponse } from '../interfaces/asaas-payment-response';
import { CobrancaAsaas } from '../types/cobranca-asaas';
import { FormaPagamento } from '../types/forma-pagamento';
import { LinkPagamento } from '../types/link-pagamento';

@Injectable()
export class CobrancaService {
  private readonly _logger = new Logger(CobrancaService.name);

  constructor(
    private readonly _env: Environment,
    private readonly _http: HttpService,
  ) {}

  gerar(cobranca: CobrancaAsaas): Observable<LinkPagamento> {
    return this._consultarClienteNaApiAsaas(cobranca).pipe(
      catchHttpErrorResponse(),
      this._prepararClienteParaGerarCobranca(cobranca),
      this._gerarCobrancaParaCliente(cobranca),
    );
  }

  private _consultarClienteNaApiAsaas(cobranca: CobrancaAsaas) {
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
    cobranca: CobrancaAsaas,
  ): OperatorFunction<AsaasCustomerResponse, LinkPagamento> {
    return concatMap((customer) =>
      this._http
        .post<LinkPagamento>(
          `${this._env.asaas.url}/v3/payments`,
          this._gerarPayloadCobranca(cobranca, customer),
          this._gerarConfiguracaoRequestAsaas(),
        )
        .pipe(
          catchHttpErrorResponse(),
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
    cobranca: CobrancaAsaas,
    customer: AsaasCustomerResponse,
  ): any {
    return {
      name: 'Comunhão de bens',
      value: cobranca.valor,
      billingType: this._definirBillingType(cobranca.formaPagamento),
      chargeType: 'DETACHED',
      description: `Pagamento via ${cobranca.formaPagamento} no valor de ${money(cobranca.valor)}`,
      customer: customer.id,
      dueDate: moment().add(2, 'days').format('YYYY-MM-DD'),
    };
  }

  private _prepararClienteParaGerarCobranca(cobranca: CobrancaAsaas) {
    return concatMap((response: AxiosResponse) => {
      const resultadoConsultaClientes =
        response.data as AsaasCustomersListResponse;
      const utilizarClienteExistente$ = defer(() =>
        of(resultadoConsultaClientes.data[0]),
      );
      const criarNovoCliente$ = this._criarNovoClienteNaApiAsaas(cobranca);
      return iif(
        () => resultadoConsultaClientes.data.length > 0,
        utilizarClienteExistente$,
        criarNovoCliente$,
      );
    });
  }

  _criarNovoClienteNaApiAsaas(
    cobranca: CobrancaAsaas,
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

  private _gerarPayloadCriacaoNovoUsuario(cobranca: CobrancaAsaas): any {
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

  private _definirBillingType(formaPagamento: FormaPagamento): string {
    if (formaPagamento === 'cartao_credito') {
      return 'CREDIT_CARD';
    }
    return 'PIX';
  }
}
