import { $, type Signal, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
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
import { Readable } from "stream";
import { killLiveQuery } from "../ObservedWalletsList/ObservedWalletsList";
import { query } from "express";
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

export const tokenRowWalletsInfoStream = server$(async function* (walletId: string, tokenSymbol: string) {

  const db = await connectToDB(this.env);
  const resultsStream = new Readable({
    objectMode: true,
    read() { },
  });

  const queryUuid: any = await db.query(`
    LIVE SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' and walletId = ${walletId};
    `)

  await db.query(
    `INSERT INTO queryuuids (queryuuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );

  yield queryUuid[0];

  const latestBalanceOfTokenForWallet =
    await db.query(`SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' 
    AND walletId = ${walletId} ORDER BY timestamp DESC LIMIT 1;`);

  yield latestBalanceOfTokenForWallet;


  const latestTokenPriceQueryUuid: any = await db.query(
    `LIVE SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}';`,
  );

  await db.query(
    `INSERT INTO queryuuids (queryuuid, enabled) VALUES ('${latestTokenPriceQueryUuid[0]}', ${true});`,
  );

  yield latestTokenPriceQueryUuid[0];

  const latestTokenPrice = await db.query(`SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}' ORDER BY timestamp DESC LIMIT 1;`);

  yield latestTokenPrice;

  const queryUuidEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${queryUuid[0]}';`,
  );

  const queryUuidTokenPriceEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${latestTokenPriceQueryUuid[0]}';`,
  );

  await db.listenLive(queryUuidEnabledLive[0], ({ action }) => {
    if (action === "UPDATE") {
      resultsStream.push(null);
      db.kill(queryUuidEnabledLive[0]);
    }
  });

  await db.listenLive(queryUuidTokenPriceEnabledLive[0], ({ action }) => {
    if (action === "UPDATE") {
      resultsStream.push(null);
      db.kill(queryUuidTokenPriceEnabledLive[0]);
    }
  });

  await db.listenLive(queryUuid[0], ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      return;
    }
    result.isBalance = true;
    resultsStream.push({ action, result });
  });

  for await (const result of resultsStream) {
    if (!result) {
      break;
    }
    yield result;
  }

  await db.query(`DELETE FROM queryuuids WHERE queryuuid = '${queryUuid[0]}';`);

})


export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({ name, symbol, balance, imagePath, balanceValueUSD, allowance, walletId, decimals, isExecutable, address, transferredCoin, isTransferModalOpen }) => {
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
      cleanup(async () => {
        await killLiveQuery(queryUuid.value);
        await killLiveQuery(latestTokenPriceQueryUuid.value)
      });

      if (!walletId) {
        throw new Error("No wallet id")
      }

      const data = await tokenRowWalletsInfoStream(walletId, symbol);

      const queryUuid = await data.next();

      currentBalanceOfToken.value = convertWeiToQuantity(
        (await data.next()).value[0][0]["walletValue"],
        parseInt(decimals)
      );

      const latestTokenPriceQueryUuid = await data.next();
      console.log((await data.next()).value)



      for await (const value of data) {
        if (value.action === "CREATE") {
          currentBalanceOfToken.value = convertWeiToQuantity(
            value.result["walletValue"],
            parseInt(decimals)
          );
          console.log(value)
        }
      }

    })


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
          <div class="overflow-auto">${balanceValueUSD}</div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-right">
            {/* <Button
              variant="onlyIcon"
              leftIcon={<IconMenuDots class="w-4 h-4 fill-white/>}
            /> */}
          </div>
        </div>
      </>
    );
  },
);
