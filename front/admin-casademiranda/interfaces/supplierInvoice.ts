export interface SupplierInvoice {
    id: number;
    invoiceNumber: string | null;
    nif: string | null;
    date: string;
    supplierName: string;
    baseAmount: number | null;
    vatRate: number | null;
    vatAmount: number | null;
    totalAmount: number;
    reference: string | null;
    notes: string | null;
}

export interface SupplierInvoiceInput {
    invoiceNumber?: string | null;
    nif?: string | null;
    date: string;
    supplierName: string;
    baseAmount?: number | null;
    vatRate?: number | null;
    vatAmount?: number | null;
    totalAmount: number;
    reference?: string | null;
    notes?: string | null;
    emailUid?: number;
}

export interface PendingSupplierEmail {
    uid: number;
    subject: string;
    from: string;
    date: string;
    supplierName: string;
}
