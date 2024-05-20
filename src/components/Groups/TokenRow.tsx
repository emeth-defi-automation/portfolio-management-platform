import { component$ } from "@builder.io/qwik";
import type { QRL, Signal } from "@builder.io/qwik";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { getTokenSymbolByAddress } from "~/database/tokens";
import Button from "../Atoms/Buttons/Button";
import IconSwap from "@material-design-icons/svg/round/swap_vert.svg?jsx";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";

const getWalletAddressById = server$(async function (walletId: string) {
  const db = await connectToDB(this.env);
  const [[walletAddress]]: any = await db.query(
    `SELECT VALUE address from ${walletId}`,
  );
  return walletAddress;
});

const getTokenAddressByTokenSymbol = server$(async function (
  tokenSymbol: string,
) {
  const db = await connectToDB(this.env);
  const [[tokenAddress]]: any = await db.query(
    `SELECT VALUE address from token where symbol = '${tokenSymbol}';`,
  );
  return tokenAddress;
});

export interface TokenRowProps {
  icon?: string;
  tokenName?: string;
  symbol: string;
  quantity?: string;
  value?: string;
  walletName?: string;
  network?: string;
  onClick$?: QRL<() => void>;
  isSwapModalOpen: Signal<boolean>;
  walletId: string;
  walletAddressOfTokenToSwap: Signal<string>;
  tokenFromAddress: Signal<string>;
  tokenFromSymbol: Signal<string>;
}
export const TokenRow = component$<TokenRowProps>((props) => {
  return (
    <>
      <div class="custom-border-b-1-opacity-5 grid grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] items-center text-nowrap py-4 text-sm last:border-b-0 last:pb-0">
        <div class="flex h-10 items-center gap-1">
          <div class="custom-border-1 flex items-center justify-center rounded-lg p-2">
            {props.icon && <img src={props.icon} width="20" height="20" />}
          </div>
          <div class="flex h-full items-center gap-1 overflow-x-auto">
            <p>{props.tokenName}</p>
            <span class="custom-text-50">{props.symbol}</span>
          </div>
        </div>
        <div class="flex h-full items-center overflow-auto">
          {props.quantity}
        </div>
        <div class="flex h-full items-center overflow-auto">{props.value}</div>

        <div class="flex h-full items-center gap-4">
          <span class="text-customGreen">3,6%</span>
          <IconGraph />
        </div>
        <div class="flex h-full items-center overflow-auto">
          {props.walletName}
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          {props.network}
        </div>
        <div
          class="flex h-full items-center overflow-auto font-medium"
          onClick$={async () => {
            props.isSwapModalOpen.value = !props.isSwapModalOpen.value;
            props.walletAddressOfTokenToSwap.value = await getWalletAddressById(
              props.walletId,
            );
            props.tokenFromAddress.value = await getTokenAddressByTokenSymbol(
              props.symbol,
            );

            props.tokenFromSymbol.value = await getTokenSymbolByAddress(
              props.tokenFromAddress.value as `0x${string}`,
            );
          }}
        >
          <Button
            variant="transparent"
            text="Swap Token"
            leftIcon={<IconSwap class="h-5 w-5 fill-white" />}
            size="small"
          />
        </div>
        <Button
          variant="onlyIcon"
          leftIcon={<IconTrash class="h-5 w-5 fill-white" />}
          onClick$={props.onClick$}
          customClass="w-7"
        />
      </div>
    </>
  );
});
