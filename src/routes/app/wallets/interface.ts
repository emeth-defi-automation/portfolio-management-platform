export interface AddWalletFormStore {
  name: string;
  address: string;
  isExecutable: number;
  isNameUnique: boolean;
  isNameUniqueLoading: boolean;
  isAddressUnique: boolean;
  coinsToCount: string[];
  coinsToApprove: {
    symbol: string;
    amount: string;
  }[];
  modalTitle: string;
}

export interface TransferredCoinInterface {
  symbol: string;
  address: string;
}
