import {
  type Signal,
  component$,
  useContext,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "/public/assets/icons/wallets/wallet.svg?jsx";
// import IconLoading from "/public/assets/icons/wallets/loading.svg?jsx";
import { TokenRowWallets } from "~/components/Tokens/TokenRowWallets";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import Button from "~/components/Atoms/Buttons/Button";
import IconTrashRed from "@material-design-icons/svg/outlined/delete.svg?jsx";
import { type Wallet } from "~/interface/auth/Wallet";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { type Token } from "~/interface/token/Token";

interface SelectedWalletProps {
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
  isTransferModalOpen: Signal<boolean>;
  transferredCoin: TransferredCoinInterface;
  selWallet: Signal<Wallet | null>;
}

export const fetchAllTokens = server$(async function () {
  const db = await connectToDB(this.env);

  const tokens = await db.select<Token>("token");
  return tokens;
});

export const SelectedWalletDetails = component$<SelectedWalletProps>(
  ({
    chainIdToNetworkName,
    isDeleteModalopen,
    isTransferModalOpen,
    transferredCoin,
  }) => {
    const selectedWalletDetails = useContext(SelectedWalletDetailsContext);
    const selectedWalletName = useContext(SelectedWalletNameContext);
    const tokens = useSignal<Token[]>([]);

    // if (!selectedWalletFromContext.value) return <></>;
    let shortAddress = selectedWalletDetails.value.address;
    if (shortAddress) {
      shortAddress = shortAddress.slice(0, 4) + "..." + shortAddress.slice(-4);
    }

    useTask$(async () => {
      tokens.value = await fetchAllTokens();
      console.log("tokens", tokens.value);
      // console.log("selectedWalletFromContext", selectedWalletFromContext.value);
    });
    return (
      <div class="grid grid-rows-[64px_1fr] gap-6">
        <div class="flex justify-between">
          <div class="">
            <h1 class="text-xl font-semibold">{selectedWalletName.value}</h1>
            <div class="mt-4 flex gap-2">
              <span class="custom-btn-gradient flex h-7 items-center rounded-lg px-[1px] text-xs ">
                <div class="flex h-[26px] items-center rounded-lg bg-black px-3">
                  {selectedWalletDetails.value.isExecutable
                    ? "Executable"
                    : "Read-only"}
                </div>
              </span>
              <span class="custom-text-50 custom-border-1 flex items-center gap-2 rounded-lg px-2 text-xs">
                <IconWallet />
                {shortAddress}
              </span>
              <span class="custom-text-50 custom-border-1 flex items-center gap-2 rounded-lg px-2 text-xs">
                <IconEthereum />
                {chainIdToNetworkName[selectedWalletDetails.value.chainId]}
              </span>
              {/* <span class="flex items-center gap-2 text-nowrap rounded-lg border border-customBlue px-2 text-xs text-customBlue">
                <IconLoading />
                Loading Tokens 5/10
              </span> */}
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              variant="transparent"
              text="Edit"
              size="small"
              customClass="font-normal"
            />
            <Button
              variant="transparent"
              text="Deactivate"
              size="small"
              customClass="font-normal"
            />
            <Button
              variant="danger"
              text="Delete Wallet"
              size="small"
              leftIcon={<IconTrashRed class="h-4 w-4" />}
              customClass="font-medium"
              onClick$={() => {
                isDeleteModalopen.value = !isDeleteModalopen.value;
              }}
            />
          </div>
        </div>
        <div class="grid gap-4">
          <div class="custom-text-50 grid grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 text-left text-xs uppercase">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            <div class="">Allowance</div>
            <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-lg bg-white bg-opacity-5 p-1 text-white">
              <button class="custom-bg-button rounded-lg px-2">24h</button>
              <button class="rounded-lg px-2">3d</button>
              <button class="rounded-lg px-2">30d</button>
            </div>
            {selectedWalletDetails.value.isExecutable ? (
              <div class=""></div>
            ) : null}
            {/* <div class="">Menu</div> */}
          </div>
          <div>
            {tokens.value.map((token: any) => {
              console.log("token", token);
              return (
                <TokenRowWallets
                  walletId={selectedWalletDetails.value.id}
                  address={token.address}
                  key={token.id}
                  imagePath={token.imagePath}
                  name={token.name}
                  symbol={token.symbol}
                  decimals={token.decimals}
                  isExecutable={selectedWalletDetails.value.isExecutable}
                  allowance={token.allowance}
                  balance={token.balance}
                  balanceValueUSD={token.balanceValueUSD}
                  isTransferModalOpen={isTransferModalOpen}
                  transferredCoin={transferredCoin}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
