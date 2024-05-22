import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "/public/assets/icons/wallets/clock.svg?jsx";
import { type Wallet } from "~/interface/auth/Wallet";
import { server$, z } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { Readable } from "stream";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { killLiveQuery } from "~/components/ObservedWalletsList/ObservedWalletsList";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";

interface ObservedWalletProps {
  observedWallet: Wallet;
  //   selectedWallet: Signal<WalletTokensBalances | null>;

  chainIdToNetworkName: { [key: string]: string };
}

export const GetWalletNameResult = z.string();

export type GetWalletNameResult = z.infer<typeof GetWalletNameResult>;

export const fetchObservedWalletName = server$(async function (
  observedWalletId: string,
) {
  const db = await connectToDB(this.env);
  const observedWalletName = (
    await db.query(
      `SELECT VALUE name FROM observes_wallet WHERE out = ${observedWalletId};`,
    )
  ).at(0);
  console.log(GetWalletNameResult.array().parse(observedWalletName));
  return GetWalletNameResult.array().parse(observedWalletName);
});

export const observedWalletNameLiveStream = server$(async function* (
  walletId: string,
) {
  const db = await connectToDB(this.env);

  const resultsStream = new Readable({
    objectMode: true,
    read() {},
  });
  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;
  const queryUuid: any =
    await db.query(`LIVE SELECT name FROM observes_wallet WHERE 
  (out = ${walletId} AND in = ${userId})`);
  console.log("obsWallet queryUuid", queryUuid);

  await db.query(
    `INSERT INTO queryuuids (queryUuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );
  console.log("instered queryUuid", queryUuid[0], true);

  yield queryUuid;

  const observedWalletName = (await fetchObservedWalletName(walletId)).at(0);
  console.log("ObsWallet observedWalletName", observedWalletName);
  yield observedWalletName;

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

  await db.listenLive(
    queryUuid,
    // The callback function takes an object with the "action" and "result" properties
    async ({ action, result }) => {
      // action can be: "CREATE", "UPDATE", "DELETE" or "CLOSE"
      if (action === "CLOSE") {
        resultsStream.push(null);
        await db.kill(queryUuid);
        return;
      }

      resultsStream.push({ action, result });
    },
  );

  for await (const result of resultsStream) {
    if (!result) {
      console.log("breaking obsWallet, result null");
      break;
    }
    yield result;
  }
  console.log("exit async for");
  await db.query(`DELETE FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`);
  return;
});

export const ObsWallet = component$<ObservedWalletProps>(
  ({ observedWallet, chainIdToNetworkName }) => {
    const selectedWalletDetails = useContext(SelectedWalletDetailsContext);
    const observedWalletNameContext = useContext(SelectedWalletNameContext);
    const observedWalletNameSignal = useSignal("");

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ cleanup }) => {
      cleanup(async () => {
        console.log("cleanup in ObsWallet", queryUuid.value);
        await killLiveQuery(queryUuid.value);
      });
      console.log("obsWallet useVisibleTask...");
      if (!observedWallet.id) return;
      const data = await observedWalletNameLiveStream(observedWallet.id);
      const queryUuid = await data.next();
      console.log("queryUuid", queryUuid);

      observedWalletNameSignal.value = (await data.next()).value;

      console.log("observedWalletName", observedWalletNameSignal.value);

      for await (const value of data) {
        console.log("obsWallet value", value);
        if (value.action === "CREATE" || value.action === "UPDATE") {
          console.log("create", value.action);
          observedWalletNameSignal.value = value.result.name;
        } else if (value.action === "DELETE") {
          console.log("delete", value.action);
          observedWalletNameSignal.value = "";
        } else {
          console.log("else", value.action);
        }
      }
    });

    return (
      <div
        class="flex h-14 cursor-pointer items-center justify-between rounded-lg"
        onClick$={() => {
          selectedWalletDetails.value = observedWallet;
          console.log("selectedWalletDetails", selectedWalletDetails.value);
          observedWalletNameContext.value = observedWalletNameSignal.value;
        }}
      >
        <div class="flex items-center gap-3">
          <div class="custom-border-1 flex h-6 w-6 items-center justify-center rounded bg-white bg-opacity-5">
            <IconEthereum />
          </div>
          <div class="">
            <div class="text-sm">{observedWalletNameSignal.value}</div>
            <div class="custom-text-50 text-xs">
              {chainIdToNetworkName[observedWallet.chainId]}
            </div>
          </div>
        </div>
        <IconClock />
      </div>
    );
  },
);
