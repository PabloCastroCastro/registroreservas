export interface Supplier {
    id: number;
    name: string;
    domain: string;
    subjectKeyword: string | null;
    invoiceNumberPattern: string | null;
    nifPattern: string | null;
    baseAmountPattern: string | null;
    vatRatePattern: string | null;
    totalAmountPattern: string | null;
    datePattern: string | null;
}

export interface SupplierTemplate {
    invoiceNumberPattern: string | null;
    nifPattern: string | null;
    baseAmountPattern: string | null;
    vatRatePattern: string | null;
    totalAmountPattern: string | null;
    datePattern: string | null;
}
