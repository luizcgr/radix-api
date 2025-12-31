import { AsaasPaymentResponse } from './asaas-payment-response';
import { AsaasWebhookPayload } from './asaas-webhook-payload';

export interface AsaasWebhookPaymentPayload extends AsaasWebhookPayload {
  id: string;
  evento: string;
  dateCreated: string;
  payment: AsaasPaymentResponse;
}
