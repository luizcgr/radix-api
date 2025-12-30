import { AsaasPaymentResponse } from './asaas-payment-response';
import { AsaasWebhookPayload } from './asaas-webhook-payload';

export interface AsaasWebhookPaymentPayload extends AsaasWebhookPayload {
  payment: AsaasPaymentResponse;
}
