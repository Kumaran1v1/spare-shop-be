import { Sale } from '../models/Sale';
import { Purchase } from '../models/Purchase';

export const generateBillNumber = async (): Promise<string> => {
  const latestSale = await Sale.findOne({}, { billNumber: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!latestSale || !latestSale.billNumber) {
    return 'SALE-000001';
  }

  const matches = latestSale.billNumber.match(/SALE-(\d+)/);
  if (matches && matches[1]) {
    const nextNum = parseInt(matches[1], 10) + 1;
    return `SALE-${nextNum.toString().padStart(6, '0')}`;
  }

  return `SALE-${Date.now()}`;
};

export const generatePurchaseNumber = async (): Promise<string> => {
  const latestPurchase = await Purchase.findOne({}, { purchaseNumber: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!latestPurchase || !latestPurchase.purchaseNumber) {
    return 'PUR-000001';
  }

  const matches = latestPurchase.purchaseNumber.match(/PUR-(\d+)/);
  if (matches && matches[1]) {
    const nextNum = parseInt(matches[1], 10) + 1;
    return `PUR-${nextNum.toString().padStart(6, '0')}`;
  }

  return `PUR-${Date.now()}`;
};
