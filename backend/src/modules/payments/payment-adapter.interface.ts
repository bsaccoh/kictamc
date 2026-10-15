export interface InitializePaymentParams {
  applicationId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  amountMinor: number;
  currency: string;
  description: string;
}

export interface PaymentInitializationResult {
  transactionReference: string;
  checkoutUrl?: string;
  provider: string;
  instructions?: string;
}

export interface VerifyPaymentResult {
  isSuccessful: boolean;
  providerReference: string;
  paidAmountMinor: number;
  currency: string;
  paymentMethod: string;
  message: string;
}

export interface PaymentProviderAdapter {
  readonly providerName: string;
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult>;
  verifyPayment(transactionReference: string): Promise<VerifyPaymentResult>;
}
