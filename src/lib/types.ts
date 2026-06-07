export interface User {
  id: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'piece' | 'box' | 'liter';
  buying_price: string;
  selling_price: string;
  barcode: string | null;
  current_stock: number;
  created_at: string;
  updated_at: string;
}

export interface ReceiptSplit {
  id: string;
  quantity: number;
  has_receipt: boolean;
}

export interface Transaction {
  id: string;
  product_id: string;
  product: Product;
  transaction_type: 'purchase' | 'sale';
  total_quantity: number;
  unit_price: string;
  discount_amount: string;
  notes: string | null;
  created_at: string;
  receipt_splits: ReceiptSplit[];
}

export interface ProductSummary {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_purchased: number;
  revenue: string;
  cost: string;
  profit: string;
  profit_margin_percent: string;
}

export interface ReceiptCompliance {
  total_transactions: number;
  purchased_with_receipt: number;
  purchased_without_receipt: number;
  sold_with_receipt: number;
  sold_without_receipt: number;
  compliance_rate_percent: string;
  risky_items: string[];
}

export interface PeriodSummary {
  period: string;
  total_revenue: string;
  total_cost: string;
  net_profit: string;
  total_discount: string;
  total_transactions: number;
  total_sales: number;
  total_purchases: number;
  top_products: ProductSummary[];
  low_stock_products: Product[];
  receipt_compliance: ReceiptCompliance;
}
