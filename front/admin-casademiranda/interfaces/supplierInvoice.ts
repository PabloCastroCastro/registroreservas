export interface VatLine {
    baseAmount: number;
    vatRate: number;
    vatAmount: number;
}

export interface SupplierInvoice {
    id: number;
    invoiceNumber: string | null;
    nif: string | null;
    date: string;
    supplierName: string;
    vatLines: VatLine[];
    totalAmount: number;
    reference: string | null;
    notes: string | null;
    filePath: string | null;
}

export interface SupplierInvoiceVatLineInput {
    baseAmount: number;
    vatRate: number;
}

export interface SupplierInvoiceInput {
    invoiceNumber?: string | null;
    nif?: string | null;
    date: string;
    supplierName: string;
    vatLines: SupplierInvoiceVatLineInput[];
    totalAmount: number;
    reference?: string | null;
    notes?: string | null;
    emailUid?: number;
    file?: File | null;
}

export interface PendingSupplierEmail {
    uid: number;
    subject: string;
    from: string;
    date: string;
    supplierId: number;
    supplierName: string;
    hasAttachment: boolean;
}

export interface ExtractedInvoiceData {
    invoiceNumber: string | null;
    nif: string | null;
    baseAmount: number | null;
    vatRatePercent: number | null;
    totalAmount: number | null;
}
