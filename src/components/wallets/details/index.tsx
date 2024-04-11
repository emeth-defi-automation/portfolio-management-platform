import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconDelete from "/public/assets/icons/wallets/delete-red.svg?jsx";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "/public/assets/icons/wallets/wallet.svg?jsx";
import { TokenRowWallets } from "~/components/tokens/tokenRow-wallets";
import { type transferredCoinInterface } from "~/routes/app/wallets";

interface SelectedWalletProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
  isTransferModalOpen: Signal<boolean>;
  transferredCoin: transferredCoinInterface;
}

export const SelectedWalletDetails = component$<SelectedWalletProps>(
  ({
    selectedWallet,
    chainIdToNetworkName,
    isDeleteModalopen,
    isTransferModalOpen,
    transferredCoin,
  }) => {
    if (!selectedWallet.value) return <></>;
    return (
      <div class="grid grid-rows-[64px_24px_1fr] gap-4 overflow-auto ">
        <div class="flex w-full items-start justify-between rounded">
          <div class="">
            <h1 class="text-xl font-semibold">
              {selectedWallet.value.wallet.name}
            </h1>
            <div class="mt-2 flex gap-4">
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="border-white-opacity-20 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[6px]">
                  <IconEthereum />
                </div>
                {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
              </span>
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="border-white-opacity-20 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[3px]">
                  <IconWallet />
                </div>
                {selectedWallet.value.wallet.address}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="mr-1 mt-1  h-[32px] cursor-pointer rounded-[40px] custom-border-2 px-[16px] text-xs duration-300 ease-in-out hover:scale-105"
            >
              Edit
            </button>
            <button
              class="mr-1 mt-1  h-[32px] cursor-pointer rounded-[40px] custom-border-2 px-[16px] text-xs duration-300 ease-in-out hover:scale-105"
            >
              Deactivate
            </button>
            <button
              class="mr-[4px] mt-[4px] flex h-[32px] cursor-pointer items-center gap-[8px] rounded-[40px] bg-red-500 bg-opacity-20 px-[16px] text-xs text-red-500 duration-300 ease-in-out hover:scale-105"
              onClick$={() => {
                isDeleteModalopen.value = !isDeleteModalopen.value;
              }}
            >
              <IconDelete />
              <p class="lg:hidden">Delete Wallet</p>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-[20%_13%_13%_14%_20%_8%_7%] items-center gap-[8px] text-left text-xs uppercase custom-text-50">
          <div class="">Token name</div>
          <div class="">Quantity</div>
          <div class="">Value</div>
          <div class="">Allowance</div>
          <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-[8px] bg-white bg-opacity-5 p-[3.5px] text-white">
            <button class="custom-bg-button rounded-[8px] px-2">24h</button>
            <button class="rounded-[8px] px-2">3d</button>
            <button class="rounded-[8px] px-2">30d</button>
          </div>
          <div class="">Authorization</div>
          <div></div>
        </div>

        <div class="h-full overflow-auto">
          <table class="w-full text-left">
            <tbody class="overflow-auto">
              {selectedWallet.value.tokens.map((token: any) => {
                return (
                  <TokenRowWallets
                    key={token.id}
                    allowance={token.allowance}
                    address={token.address}
                    name={token.name}
                    symbol={token.symbol}
                    balance={token.balance}
                    imagePath={token.imagePath}
                    balanceValueUSD={token.balanceValueUSD}
                    isTransferModalOpen={isTransferModalOpen}
                    transferredCoin={transferredCoin}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
