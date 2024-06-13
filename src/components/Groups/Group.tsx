import { component$, type JSXOutput } from "@builder.io/qwik";
import type { QRL, Signal } from "@builder.io/qwik";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import {
  type Structure,
  type StructureBalance,
} from "~/interface/structure/Structure";
import { TokenRow } from "~/components/Groups/TokenRow";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";
import Button from "../Atoms/Buttons/Button";

export interface GroupProps {
  createdStructure: Structure;
  onClick$?: QRL<() => void>;
  tokenStore: { balanceId: string; structureId: string };
  isSwapModalOpen: Signal<boolean>;
  walletAddressOfTokenToSwap: Signal<string>;
  tokenFromAddress: Signal<string>;
  tokenFromSymbol: Signal<string>;
}

function extractData(
  createdStructure: Structure,
  tokenStore: { balanceId: string; structureId: string },
  isSwapModalOpen: Signal<boolean>,
  walletAddressOfTokenToSwap: Signal<string>,
  tokenFromAddress: Signal<string>,
  tokenFromSymbol: Signal<string>,
): JSXOutput[] {
  const extractedArray: {
    walletId: string;
    walletName: string;
    symbol: string;
    tokenName: string;
    quantity: string;
    networkName: string;
    value: string;
    balanceId: string;
    structureId: string;
  }[] = [];
  createdStructure.structureBalance.forEach(
    (balanceEntry: StructureBalance) => {
      extractedArray.push({
        walletId: balanceEntry.wallet.id,
        walletName: balanceEntry.wallet.name,
        networkName:
          chainIdToNetworkName[balanceEntry.wallet.chainId.toString()],
        symbol: balanceEntry.balance.symbol,
        tokenName: balanceEntry.balance.name,
        quantity: convertWeiToQuantity(
          balanceEntry.balance.balance,
          balanceEntry.balance.decimals,
        ),
        value: balanceEntry.balance.balanceValueUSD,
        balanceId: balanceEntry.balance.balanceId as string,
        structureId: createdStructure.structure.id as string,
      });
    },
  );

  return extractedArray.map((entry: any, index: number) => (
    <TokenRow
      key={`${entry.balanceId} - ${index}`}
      icon={`/assets/icons/tokens/${entry.symbol.toLowerCase()}.svg`}
      tokenName={entry.tokenName}
      symbol={entry.symbol}
      quantity={entry.quantity}
      value={`$${(entry.value * entry.quantity).toFixed(2)}`}
      walletName={entry.walletName}
      network={entry.networkName}
      onClick$={() => {
        tokenStore.balanceId = entry.balanceId;
        tokenStore.structureId = entry.structureId;
      }}
      isSwapModalOpen={isSwapModalOpen}
      walletId={entry.walletId}
      walletAddressOfTokenToSwap={walletAddressOfTokenToSwap}
      tokenFromAddress={tokenFromAddress}
      tokenFromSymbol={tokenFromSymbol}
    />
  ));
}

export const Group = component$<GroupProps>((props) => {
  return (
    <>
      <div class="">
        <div class="item-center flex gap-6 text-sm">
          <div class="flex items-center gap-2">
            <IconArrowDown class="h-4 w-4 fill-white" />
            <h3>{props.createdStructure.structure.name}</h3>
            <Button
              variant="onlyIcon"
              leftIcon={<IconTrash class="h-4 w-4 fill-white" />}
              onClick$={props.onClick$}
            />
          </div>
          <Button variant="transparent" text="See Performance" size="small" />
        </div>
        <div>
          {extractData(
            props.createdStructure,
            props.tokenStore,
            props.isSwapModalOpen,
            props.walletAddressOfTokenToSwap,
            props.tokenFromAddress,
            props.tokenFromSymbol,
          )}
        </div>
      </div>
    </>
  );
});
