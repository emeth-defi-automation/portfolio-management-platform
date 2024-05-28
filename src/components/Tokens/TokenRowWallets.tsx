import {
  $,
  type Signal,
  component$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
// import Button from "../Atoms/Buttons/Button";
// import IconMenuDots from "@material-design-icons/svg/outlined/more_vert.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import {
  Image,
  type ImageTransformerProps,
  useImageProvider,
} from "qwik-image";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Readable } from "stream";
import { killLiveQuery } from "../ObservedWalletsList/ObservedWalletsList";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

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

  // live query for latest balance of token for wallet
  const queryUuid: any =
    await db.query(`LIVE SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' 
    AND walletId = ${walletId} ORDER BY timestamp DESC LIMIT 1`);
  await db.query(
    `INSERT INTO queryuuids (queryUuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );
  yield queryUuid;

  // get latest balance of token for wallet
  const latestBalanceOfTokenForWallet =
    await db.query(`SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' 
      AND walletId = ${walletId} ORDER BY timestamp DESC LIMIT 1;`);
  console.log("latestBalanceOfTokenForWallet", latestBalanceOfTokenForWallet);
  yield latestBalanceOfTokenForWallet;

  const latestTokenPriceQueryUuid: any =
    await db.query(`LIVE SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}'
  ORDER BY timestamp DESC LIMIT 1;`);
  await db.query(
    `INSERT INTO queryuuids (queryUuid, enabled) VALUES ('${latestTokenPriceQueryUuid}', ${true});`,
  );
  yield latestTokenPriceQueryUuid;

  const latestTokenPrice = await db.query(
    `SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}' 
    ORDER BY timestamp DESC LIMIT 1;`,
  );
  console.log("latestTokenPrice", latestTokenPrice);
  yield latestTokenPrice;

  const queryUuidEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`,
  );

  const queryUuidTokenPriceEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryUuid = '${latestTokenPriceQueryUuid[0]}';`,
  );

  await db.listenLive(queryUuidEnabledLive[0], ({ action, result }) => {
    if (action === "UPDATE") {
      console.log("result", result);
      console.log("pushing null to resultStream");
      resultsStream.push(null);
      db.kill(queryUuidEnabledLive[0]);
    }
  });

  await db.listenLive(
    queryUuidTokenPriceEnabledLive[0],
    ({ action, result }) => {
      if (action === "UPDATE") {
        console.log("result", result);
        console.log("pushing null to resultStream");
        resultsStream.push(null);
        db.kill(queryUuidTokenPriceEnabledLive[0]);
      }
    },
  );

  await db.listenLive(queryUuid, ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      return;
    }

    resultsStream.push({ action, result });
  });

  for await (const result of resultsStream) {
    if (!result) {
      console.log("result is NULL");
      break;
    }
    yield result;
  }
  console.log("exit async for in tokenrowwallets");
  await db.query(`DELETE FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`);
  await db.query(
    `DELETE FROM queryuuids WHERE queryUuid = '${latestTokenPriceQueryUuid[0]}';`,
  );
  return;
});

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({
    walletId,
    name,
    symbol,
    decimals,
    balance,
    imagePath,
    balanceValueUSD,
    allowance,
    address,
  }) => {
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
    useVisibleTask$(async ({ cleanup }) => {
      if (walletId === undefined) {
        throw new Error("walletId is undefined");
      }
      const data = await tokenRowWalletsInfoStream(walletId, symbol);

      cleanup(async () => {
        console.log("clenaup starts TokenRowWallets");
        await killLiveQuery(queryUuid.value);
        await killLiveQuery(latestTokenPriceQueryUuid.value);
      });

      const queryUuid = await data.next();
      console.log("queryUuid", queryUuid);
      currentBalanceOfToken.value = convertWeiToQuantity(
        (await data.next()).value[0][0]["walletValue"],
        parseInt(decimals),
      );
      console.log("currentBalanceOfToken", currentBalanceOfToken.value);

      const latestTokenPriceQueryUuid = await data.next();
      console.log("latestTokenPriceQueryUuid", latestTokenPriceQueryUuid);

      latestTokenPrice.value = (await data.next()).value[0][0]["price"];
      console.log("latestTokenPrice", latestTokenPrice);

      latestBalanceUSD.value = (
        Number(currentBalanceOfToken.value) * Number(latestTokenPrice.value)
      ).toFixed(2);

      for await (const value of data) {
        console.log("value", value);
        if (value.action === "CREATE") {
          console.log("CREATE BLLOCK");

          currentBalanceOfToken.value = convertWeiToQuantity(
            value.result.balance,
            parseInt(decimals),
          );
        }
      }
    });

    return (
      <>
        <div class="custom-border-b-1 grid  grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 py-2 text-sm">
          <div class="flex items-center gap-4 py-2">
            <div class="custom-border-1 rounded-lg p-[10px]">
              <Image
                layout="constrained"
                objectFit="fill"
                width={24}
                height={24}
                alt={`${name} logo`}
                src={imagePath}
              />
            </div>
            <p class="">
              {name} <span class="custom-text-50 pl-1 text-xs">{symbol}</span>
            </p>
          </div>
          <div class="overflow-auto">{currentBalanceOfToken.value}</div>
          <div class="overflow-auto">${latestBalanceUSD.value}</div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-right"></div>
        </div>
      </>
    );
  },
);
