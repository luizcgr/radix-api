import { AsaasCustomerResponse } from './asaas-customer-response';

export interface AsaasCustomersListResponse {
  totalCount: number;
  hasMore: boolean;
  limit: number;
  offset: number;
  data: AsaasCustomerResponse[];
}
