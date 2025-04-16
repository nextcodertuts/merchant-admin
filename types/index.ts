export interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionId?: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  maxBusinesses: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalCredit: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bankName?: string;
  ifscCode?: string;
  accountNo?: string;
  invoicePrefix?: string;
  upiId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  buyPrice: number;
  price: number;
  unit: string;
  taxPercent: number;
  stock: number;
  minStock: number;
  images: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockLog {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  type: string;
  note?: string;
  userId: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice: Invoice;
  amount: number;
  method: string;
  reference?: string;
  note?: string;
  userId: string;
  date: Date;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  date: Date;
  dueDate: Date;
  status: string;
  total: number;
  amountPaid: number;
  balance: number;
  userId: string;
  businessId: string;
  business?: Business;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  price: number;
  id: string;
  quantity: number;
  productId: string;
  product: Product;
  invoiceId: string;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description?: string;
  paymentMode: string;
  reference?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalSales: number;
  totalCredit: number;
  totalProducts: number;
  pendingInvoices: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
  lowStockProducts: Product[];
  salesTrend: number;
  creditTrend: number;
  expenseTrend: number;
  grossProfitTrend: number;
  netProfitTrend: number;
  profitMetrics: {
    totalCost: number;
    grossMarginPercent: number;
    netMarginPercent: number;
  };
}
