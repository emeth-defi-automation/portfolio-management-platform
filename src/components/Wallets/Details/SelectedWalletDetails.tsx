import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "@material-design-icons/svg/round/wallet.svg?jsx";
import IconLoading from "@material-design-icons/svg/round/sync.svg?jsx";
import { TokenRowWallets } from "~/components/Tokens/TokenRowWallets";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import Button from "~/components/Atoms/Buttons/Button";
import Tag from "~/components/Atoms/Tags/Tag";
import IconTrashRed from "@material-design-icons/svg/outlined/delete.svg?jsx";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import BoxHeader from "../../Molecules/BoxHeader/BoxHeader";

interface SelectedWalletProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
  isTransferModalOpen: Signal<boolean>;
  transferredCoin: TransferredCoinInterface;
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
    let shortAddress = selectedWallet.value.wallet.address;
    if (shortAddress) {
      shortAddress = shortAddress.slice(0, 4) + "..." + shortAddress.slice(-4);
    }
    return (
      <div class="grid grid-rows-[32px_28px_1fr] gap-6">
        <BoxHeader variantHeader="h3" title={selectedWallet.value.wallet.name}>
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
        </BoxHeader>
        <div class="flex gap-2">
          <Tag
            variant="gradient"
            text={
              selectedWallet.value.wallet.isExecutable
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
            icon={<IconWallet class="h-4 w-4 fill-white" />}
          />
          <Tag
            text={chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
            icon={<IconEthereum class="h-5 w-5" />}
          />
          <Tag
            variant="blueText"
            isBorder={false}
            text="Loading Tokens 5/10"
            icon={<IconLoading class="h-4 w-4 fill-customBlue" />}
          />
        </div>
        <div class="grid gap-4">
          <div class="custom-text-50 grid grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 text-left text-xs uppercase">
            <Annotation text="Token name" transform="upper" />
            <Annotation text="Quantity" transform="upper" />
            <Annotation text="Value" transform="upper" />
            <Annotation text="Allowance" transform="upper" />
            <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-lg bg-white bg-opacity-5 p-1 text-white">
              <button class="custom-bg-button rounded-lg px-2">24h</button>
              <button class="rounded-lg px-2">3d</button>
              <button class="rounded-lg px-2">30d</button>
            </div>
            {selectedWallet.value.wallet.isExecutable ? (
              <div class=""></div>
            ) : null}
          </div>
          <div>
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
                  isExecutable={selectedWallet.value?.wallet.isExecutable}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
