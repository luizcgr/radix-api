export interface AsaasPaymentResponse {
  id: string;
  customer: string;
  value: number;
  invoiceUrl: string;
  invoiceNumber: string;
  billingType: string;
  status: string;
}
