import {
  type Signal,
  component$,
  useContext,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "/public/assets/icons/wallets/wallet.svg?jsx";
import IconLoading from "@material-design-icons/svg/round/sync.svg?jsx";
import { TokenRowWallets } from "~/components/Tokens/TokenRowWallets";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import Button from "~/components/Atoms/Buttons/Button";
import Tag from "~/components/Atoms/Tags/Tag";
import IconTrashRed from "@material-design-icons/svg/outlined/delete.svg?jsx";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { type Token } from "~/interface/token/Token";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";

interface SelectedWalletProps {
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
  isTransferModalOpen: Signal<boolean>;
  transferredCoin: TransferredCoinInterface;
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

    if (!selectedWalletDetails.value) return <></>;
    let shortAddress = selectedWalletDetails.value.address;
    if (shortAddress) {
      shortAddress = shortAddress.slice(0, 4) + "..." + shortAddress.slice(-4);
    }

    useTask$(async () => {
      tokens.value = await fetchAllTokens();
    });

    return (
      <div class="grid grid-rows-[64px_1fr] gap-6">
        <div class="flex justify-between">
          <div class="">
            <h1 class="text-xl font-semibold">{selectedWalletName.value}</h1>
            <div class="mt-4 flex gap-2">
              <Tag
                variant="gradient"
                text={
                  selectedWalletDetails.value.isExecutable
                    ? "Executable"
                    : "Read-only"
                }
                isBorder={true}
                class="px-3"
              />
              <Tag
                variant="greyText"
                isBorder={true}
                text={shortAddress}
                icon={<IconWallet />}
              />
              <Tag
                text={chainIdToNetworkName[selectedWalletDetails.value.chainId]}
                icon={<IconEthereum class="h-5 w-5" />}
              />
              <Tag
                variant="blueText"
                isBorder={false}
                text="Loading Tokens 5/10"
                icon={<IconLoading class="h-4 w-4 fill-customBlue" />}
              />
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
              return (
                <TokenRowWallets
                  decimals={token.decimals}
                  walletId={selectedWalletDetails.value.id}
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
                  isExecutable={selectedWalletDetails.value.isExecutable}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
