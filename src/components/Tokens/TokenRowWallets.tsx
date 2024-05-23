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

type TokenRowWalletsProps = {
  walletId?: string;
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
    AND walletId = ${walletId}`);
  await db.query(
    `INSERT INTO queryuuids (queryUuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );
  yield queryUuid;

  // get latest balance of token for wallet
  console.log("tokenSymbol", tokenSymbol);
  console.log("walletId", walletId);
  const latestBalanceOfTokenForWallet =
    await db.query(`SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' 
      AND walletId = ${walletId} ORDER BY timestamp DESC LIMIT 1;`);
  console.log("latestBalanceOfTokenForWallet", latestBalanceOfTokenForWallet);
  yield latestBalanceOfTokenForWallet;

  const queryUuidEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`,
  );

  await db.listenLive(queryUuidEnabledLive[0], ({ action, result }) => {
    if (action === "UPDATE") {
      console.log("result", result);
      console.log("pushing null to resultStream");
      resultsStream.push(null);
      db.kill(queryUuidEnabledLive[0]);
    }
  });

  await db.listenLive(queryUuid, ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      resultsStream.destroy();
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
  return;
});

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({
    walletId,
    name,
    symbol,
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

    useVisibleTask$(async ({ cleanup }) => {
      if (walletId === undefined) {
        throw new Error("walletId is undefined");
      }
      const data = await tokenRowWalletsInfoStream(walletId, symbol);

      cleanup(async () => {
        console.log("clenaup starts TokenRowWallets");
        await killLiveQuery(queryUuid.value);
      });

      const queryUuid = await data.next();
      console.log("queryUuid", queryUuid);
      currentBalanceOfToken.value = (await data.next()).value[0][0][
        "walletValue"
      ];

      console.log("currentBalanceOfToken", currentBalanceOfToken.value);

      for await (const value of data) {
        console.log("value", value);
        if (value.action === "CREATE") {
          console.log("CREATE BLLOCK");
          currentBalanceOfToken.value = value.result.balance;
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
          <div class="overflow-auto">${balanceValueUSD}</div>
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
