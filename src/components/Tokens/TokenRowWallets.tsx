import {
  $,
  component$,
  useSignal,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
// import Button from "../Atoms/Buttons/Button";
// import IconMenuDots from "@material-design-icons/svg/outlined/more_vert.svg?jsx";
import { server$ } from "@builder.io/qwik-city";
import { useImageProvider, type ImageTransformerProps } from "qwik-image";
import { Readable } from "stream";
import { connectToDB } from "~/database/db";
import { type actionType } from "~/routes/app/portfolio/interface";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";
import { killLiveQuery } from "../ObservedWalletsList/ObservedWalletsList";
import {
  createLiveQuery,
  fetchLatestTokenBalance,
  fetchLatestTokenPrice,
  type LatestTokenBalance,
  type LiveQueryResult,
} from "./tokenRowWalletsTypes";
import IconGraph from "/public/assets/icons/graph.svg?jsx";

type TokenRowWalletsProps = {
  walletId?: string;
  decimals: string;
  name: string;
  symbol: string;
  balance: string;
  imagePath: string;
  balanceValueUSD: string;
  isTransferModalOpen: Signal<boolean>;
  address: string;
  transferredCoin: TransferredCoinInterface;
  allowance: string;
  isExecutable: boolean | undefined;
};

export const tokenRowWalletsInfoStream = server$(async function* (
  walletId: string,
  tokenSymbol: string,
) {
  const db = await connectToDB(this.env);
  const resultsStream = new Readable({
    objectMode: true,
    read() {},
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

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({ name, symbol, imagePath, allowance, walletId, decimals }) => {
    const imageTransformer$ = $(
      ({ src, width, height }: ImageTransformerProps): string => {
        return `${src}?height=${height}&width=${width}&format=webp&fit=fill`;
      },
    );

    useImageProvider({
      resolutions: [1920, 1280],
      imageTransformer$,
    });

    const currentBalanceOfToken = useSignal("");
    const latestTokenPrice = useSignal("");
    const latestBalanceUSD = useSignal("");

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      const trackedValues = track(() => ({
        latestTokenPrice: latestTokenPrice.value,
        currentBalanceOfToken: currentBalanceOfToken.value,
      }));

      if (symbol === "USDT") {
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

      if (!walletId) {
        throw new Error("No wallet id");
      }

      const data = await tokenRowWalletsInfoStream(walletId, symbol);

      const queryUuid: LiveQueryResult = (await data.next()).value;

      const wallet: LatestTokenBalance | undefined = (await data.next()).value;
      if (!wallet) {
        currentBalanceOfToken.value = "0";
      } else {
        currentBalanceOfToken.value = convertWeiToQuantity(
          wallet["walletValue"],
          parseInt(decimals),
        );
      }

      const latestTokenPriceQueryUuid: LiveQueryResult = (await data.next())
        .value;
      latestTokenPrice.value = (await data.next()).value["price"];

      let previousTime = new Date("1970-01-01T00:00:00Z").getTime();

      for await (const { action, type, result } of data) {
        const { timestamp, walletValue, price } = result;
        if (action === "CREATE") {
          if (type === "BALANCE") {
            let recentTime = timestamp;
            if (new Date(recentTime).getTime() >= previousTime) {
              currentBalanceOfToken.value = convertWeiToQuantity(
                walletValue,
                parseInt(decimals),
              );
              previousTime = recentTime;
            }
          } else {
            latestTokenPrice.value = price;
          }
        } else if (action === "UPDATE") {
          if (type === "PRICE") {
            latestTokenPrice.value = price;
          }
        }
      }
    });

    return Number(currentBalanceOfToken.value) ||
      Number(latestBalanceUSD.value) ? (
      <>
        <div class="custom-border-b-1 grid  grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 py-2 text-sm">
          <ParagraphAnnotation
            paragraphText={name}
            annotationText={symbol}
            variant="annotationNear"
            hasIconBox={true}
            iconBoxSize="small"
            iconBoxTokenPath={imagePath}
          />
          <div
            key={`${currentBalanceOfToken.value}:${symbol}`}
            class="animate-fadeIn overflow-auto"
          >
            {currentBalanceOfToken.value}
          </div>
          <div
            key={`${latestBalanceUSD.value}:${symbol}`}
            class="animate-fadeIn overflow-auto"
          >
            ${latestBalanceUSD.value}
          </div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-right">
            {/* 
            leave it till it will be needed
            <Button
              variant="onlyIcon"
              leftIcon={<IconMenuDots class="w-4 h-4 fill-white/>}
            /> */}
          </div>
        </div>
      </>
    ) : (
      <>
        <div class="custom-border-b-1 grid  grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 py-2 text-sm">
          <ParagraphAnnotation
            paragraphText={name}
            annotationText={symbol}
            variant="annotationNear"
            hasIconBox={true}
            iconBoxSize="small"
            iconBoxTokenPath={imagePath}
          />
          <div
            key={`${currentBalanceOfToken.value}:${symbol}`}
            class="animate-fadeIn overflow-auto"
          >
            Loading...
          </div>
          <div
            key={`${latestBalanceUSD.value}:${symbol}`}
            class="animate-fadeIn overflow-auto"
          >
            $0.00
          </div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-right">
            {/* 
        leave it till it will be needed
        <Button
          variant="onlyIcon"
          leftIcon={<IconMenuDots class="w-4 h-4 fill-white/>}
        /> */}
          </div>
        </div>
      </>
    );
  },
);
