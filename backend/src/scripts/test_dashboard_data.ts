import { paymentsService } from '../modules/payments/payments.service';

async function test() {
  try {
    const data = await paymentsService.getFinanceDashboardData('30d');
    console.log('--- DASHBOARD TEST OUTPUT ---');
    console.log('KPIs:', JSON.stringify(data.kpis, null, 2));
    console.log('Payment Methods:', JSON.stringify(data.paymentMethods, null, 2));
    console.log('Recent Transactions Count:', data.transactions.length);
    console.log('First Transaction:', data.transactions[0]);
    console.log('Payment Status Summary:', data.paymentStatusSummary);
    console.log('Recent Activity:', data.recentActivity);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    process.exit(0);
  }
}

test();
