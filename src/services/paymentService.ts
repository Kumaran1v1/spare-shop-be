import { Sale } from '../models/Sale';
import { Purchase } from '../models/Purchase';

export class PaymentService {
  static async getPendingPayments(params: { search?: string }, userId: string) {
    const { search } = params;

    const saleFilter: any = { createdBy: userId, pendingAmount: { $gt: 0 } };
    const purchaseFilter: any = { createdBy: userId, pendingAmount: { $gt: 0 } };

    if (search) {
      const regex = new RegExp(search, 'i');
      saleFilter.$or = [
        { billNumber: regex },
        { customerName: regex },
        { customerMobile: regex },
      ];
      purchaseFilter.$or = [
        { purchaseNumber: regex },
        { supplierName: regex },
        { supplierInvoiceNumber: regex },
      ];
    }

    const [customerPending, supplierPending] = await Promise.all([
      Sale.find(saleFilter)
        .select('billNumber customerName customerMobile saleDate grandTotal paidAmount pendingAmount paymentStatus')
        .sort({ createdAt: -1 })
        .lean(),
      Purchase.find(purchaseFilter)
        .select('purchaseNumber supplierName supplierMobile purchaseDate grandTotal paidAmount pendingAmount paymentStatus')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      customerPending,
      supplierPending,
    };
  }
}
