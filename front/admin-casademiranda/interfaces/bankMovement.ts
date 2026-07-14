export type BankMovementType = 'ingreso' | 'gasto';

export interface BankMovement {
    id: number;
    date: string;
    type: BankMovementType;
    description: string;
    amount: number;
    notes: string | null;
}

export interface BankMovementInput {
    date: string;
    type: BankMovementType;
    description: string;
    amount: number;
    notes?: string | null;
}
