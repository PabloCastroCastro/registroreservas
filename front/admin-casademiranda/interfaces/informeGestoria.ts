export interface ClienteDetalle {
    confirmationNumber: string;
    checkOut: string;
    nights: number;
    roomName: string;
    roomPrice: number;
    extraBedCount: number | null;
    extraBedPrice: number | null;
    total: number;
}

export interface ProveedorDetalle {
    invoiceNumber: string | null;
    date: string;
    totalAmount: number;
    supplierName: string;
    notes: string | null;
}

export interface InformeGestoria {
    ingresosFacturas: number;
    gastosFacturas: number;
    ingresosBanco: number;
    gastosBanco: number;
    resultado: number;
    clientes: ClienteDetalle[];
    proveedores: ProveedorDetalle[];
    movimientos: BankMovementDetalle[];
}

export interface BankMovementDetalle {
    id: number;
    date: string;
    type: 'ingreso' | 'gasto';
    description: string;
    amount: number;
    notes: string | null;
}
