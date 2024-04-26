export interface AddWalletFormStore {
    name: string;
    address: string;
    isExecutable: number;
    isNameUnique: boolean;
    isNameUniqueLoading: boolean;
    coinsToCount: string[];
    coinsToApprove: {
        symbol: string;
        amount: string;
    }[];
}