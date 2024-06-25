export type WalletBalance = [
  { balanceId: string; tokenId: string; tokenSymbol: string },
];

export type WalletWithBalance = {
  wallet: {
    id: string;
    chainID: number;

    address: string;
    isExecutable: boolean;
  };
  walletName: string;
  balance: WalletBalance;
};

export type CoinToApprove = {
  wallet: string;
  isExecutable: string;
  address: string;
  symbol: string;
  amount: string;
  isChecked: boolean;
};
export type StructureToApprove = {
  name: string;
  coins: CoinToApprove[];
  isChecked?: boolean
};
export interface BatchTransferFormStore {
  receiverAddress: string;
  coinsToTransfer: StructureToApprove[];
}
export type actionType = "PRICE" | "BALANCE";
