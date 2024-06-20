import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { QRL, Signal } from "@builder.io/qwik";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { getTokenSymbolByAddress } from "~/database/tokens";
import Button from "../Atoms/Buttons/Button";
import IconSwap from "@material-design-icons/svg/round/swap_vert.svg?jsx";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";
import { LatestTokenBalance, LiveQueryResult, createLiveQuery, fetchLatestTokenBalance, fetchLatestTokenPrice } from "../Tokens/tokenRowWalletsTypes";
import { actionType } from "../Tokens/TokenRowWallets";
import { Readable } from "stream";
import { killLiveQuery } from "../ObservedWalletsList/ObservedWalletsList";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { Token } from "~/interface/token/Token";
import { fetchAllTokens } from "../Wallets/Details/SelectedWalletDetails";

export const tokenRowWalletsInfoStream = server$(async function* (
  walletId: string,
  tokenSymbol: string,
) {
  const db = await connectToDB(this.env);
  const resultsStream = new Readable({
    objectMode: true,
    read() { },
  });

  const walletBalanceLiveQuery = `
    LIVE SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' and walletId = ${walletId};
    `;

  const queryUuid = await createLiveQuery(db, walletBalanceLiveQuery);

  await db.query(
    `INSERT INTO queryuuids (queryuuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );

  yield queryUuid;

  const latestBalanceOfTokenForWallet = await fetchLatestTokenBalance(
    db,
    tokenSymbol,
    walletId,
  );

  yield latestBalanceOfTokenForWallet;

  //we dont keep usdt price in database.
  //we just assume its always 1$. that if statement is
  // in order not to get an error from trying
  //to fetch something that doesnt exist in database.
  if (tokenSymbol === "USDT") {
    tokenSymbol = "USDC";
  }

  const latestTokenPriceLiveQuery = `LIVE SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}';`;

  const latestTokenPriceQueryUuid = await createLiveQuery(
    db,
    latestTokenPriceLiveQuery,
  );

  await db.query(
    `INSERT INTO queryuuids (queryuuid, enabled) VALUES ('${latestTokenPriceQueryUuid}', ${true});`,
  );

  yield latestTokenPriceQueryUuid;

  const latestTokenPrice = await fetchLatestTokenPrice(db, tokenSymbol);

  yield latestTokenPrice;

  const queryUuidEnabledLiveQuery = `LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${queryUuid}';`;

  const queryUuidEnabledLive = await createLiveQuery(
    db,
    queryUuidEnabledLiveQuery,
  );

  const queryUuidTokenPriceEnabledLiveQuery = `LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${latestTokenPriceQueryUuid}';`;

  const queryUuidTokenPriceEnabledLive = await createLiveQuery(
    db,
    queryUuidTokenPriceEnabledLiveQuery,
  );

  await db.listenLive(queryUuidEnabledLive, ({ action }) => {
    if (action === "UPDATE") {
      resultsStream.push(null);
      db.kill(queryUuidEnabledLive);
    }
  });

  await db.listenLive(queryUuidTokenPriceEnabledLive, ({ action }) => {
    if (action === "UPDATE") {
      resultsStream.push(null);
      db.kill(queryUuidTokenPriceEnabledLive);
    }
  });

  await db.listenLive(queryUuid, ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      return;
    }
    resultsStream.push({ action, result, type: "BALANCE" as actionType });
  });

  await db.listenLive(latestTokenPriceQueryUuid, ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      return;
    }
    resultsStream.push({ action, result, type: "PRICE" as actionType });
  });

  for await (const result of resultsStream) {
    if (!result) {
      break;
    }
    yield result;
  }

  await db.query(`DELETE FROM queryuuids WHERE queryuuid = '${queryUuid}';`);
  await db.query(
    `DELETE FROM queryuuids WHERE queryuuid = '${latestTokenPriceQueryUuid}';`,
  );
});

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

  const currentBalanceOfToken = useSignal("");
  const latestTokenPrice = useSignal("");
  const latestBalanceUSD = useSignal("");
  const tokens = useSignal<Token[]>([]);
  const decimals = useSignal<number>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const trackedValues = track(() => ({
      latestTokenPrice: latestTokenPrice.value,
      currentBalanceOfToken: currentBalanceOfToken.value,
    }));

    if (props.symbol === "USDT") {
      latestBalanceUSD.value = (
        Number(trackedValues.currentBalanceOfToken) * 1
      ).toFixed(2);
    } else {
      latestBalanceUSD.value = (
        Number(trackedValues.currentBalanceOfToken) *
        Number(trackedValues.latestTokenPrice)
      ).toFixed(2);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    cleanup(async () => {
      await killLiveQuery(queryUuid);
      await killLiveQuery(latestTokenPriceQueryUuid);
    });


    tokens.value = await fetchAllTokens();

    tokens.value.forEach((token) => {
      if (token.symbol === props.symbol) {
        decimals.value = token.decimals;
      }
    })


    if (!props.walletId) {
      throw new Error("No wallet id");
    }

    const data = await tokenRowWalletsInfoStream(props.walletId, props.symbol);

    const queryUuid: LiveQueryResult = (await data.next()).value;

    const wallet: LatestTokenBalance | undefined = (await data.next()).value;
    if (!wallet) {
      currentBalanceOfToken.value = "0";
    } else {
      currentBalanceOfToken.value = convertWeiToQuantity(
        wallet["walletValue"],
        decimals.value!,
      );
    }

    const latestTokenPriceQueryUuid: LiveQueryResult = (await data.next())
      .value;
    latestTokenPrice.value = (await data.next()).value["price"];

    for await (const value of data) {
      if (value.action === "CREATE") {
        if (value.type === "BALANCE") {
          currentBalanceOfToken.value = convertWeiToQuantity(
            value.result["walletValue"],
            decimals.value!,
          );
        } else {
          latestTokenPrice.value = value.result["price"];
        }
      } else if (value.action === "UPDATE") {
        if (value.type === "PRICE") {
          latestTokenPrice.value = value.result["price"];
        }
      }
    }
  });

  return (
    <>
      <div class="custom-border-b-1-opacity-5 grid grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] items-center text-nowrap py-4 text-sm last:border-b-0 last:pb-0">
        <ParagraphAnnotation
          paragraphText={props.tokenName}
          annotationText={props.symbol}
          variant="annotationNear"
          hasIconBox={true}
          iconBoxSize="small"
          iconBoxTokenPath={props.icon}
        />
        <div class="flex h-full items-center overflow-auto">
          {currentBalanceOfToken.value}
        </div>
        <div class="flex h-full items-center overflow-auto">${latestBalanceUSD.value}</div>

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
