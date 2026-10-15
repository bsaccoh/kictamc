import crypto from 'crypto';
import {
  PaymentProviderAdapter,
  InitializePaymentParams,
  PaymentInitializationResult,
  VerifyPaymentResult,
} from './payment-adapter.interface';

export class MockOnlinePaymentProvider implements PaymentProviderAdapter {
  readonly providerName = 'KICTAMC Instant Gateway (Mock)';

  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult> {
    const transactionReference = `MOCK-PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return {
      transactionReference,
      checkoutUrl: `/payment/simulate-checkout?ref=${transactionReference}`,
      provider: this.providerName,
      instructions: 'Simulated Instant Mobile / Card Checkout Portal',
    };
  }

  async verifyPayment(transactionReference: string): Promise<VerifyPaymentResult> {
    return {
      isSuccessful: true,
      providerReference: transactionReference,
      paidAmountMinor: 20000,
      currency: 'SLE',
      paymentMethod: 'ONLINE_MOCK',
      message: 'Simulated payment completed and verified successfully.',
    };
  }
}

export const mockPaymentProvider = new MockOnlinePaymentProvider();
