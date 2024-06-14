import {
  type Signal,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "/public/assets/icons/wallets/clock.svg?jsx";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { Readable } from "stream";
import jwt, { JwtPayload } from "jsonwebtoken";
import { killLiveQuery } from "~/components/ObservedWalletsList/ObservedWalletsList";

interface ObservedWalletProps {
  observedWallet: any;
  chainIdToNetworkName: { [key: string]: string };
}

export const fetchObservedWalletName = server$(async function (
  observedWalletId: string,
) {
  const db = await connectToDB(this.env);
  const [[observedWalletName]]: any = await db.query(
    `SELECT VALUE name FROM observes_wallet WHERE out = ${observedWalletId}`,
  );

  return observedWalletName;
});

export const observedWalletNameLiveStream = server$(async function* (
  walletId: string,
) {
  const db = await connectToDB(this.env);

  const resultStream = new Readable({
    objectMode: true,
    read() {},
  });

  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;

  const queryUuid: any = await db.query(`
    LIVE SELECT name FROM observes_wallet WHERE in=${userId} and out=${walletId}
    `);

  yield queryUuid[0];

  await db.query(`
    INSERT INTO queryuuids (queryuuid, enabled) VALUES ('${queryUuid[0]}',${true});
    `);

  const queryUuidEnabledLive: any = await db.query(`
    LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${queryUuid[0]}';
    `);

  await db.listenLive(queryUuidEnabledLive[0], ({ action }) => {
    if (action === "UPDATE") {
      resultStream.push(null);
      db.kill(queryUuidEnabledLive[0]);
    }
  });

  const observedWalletName = await fetchObservedWalletName(walletId);

  yield observedWalletName;

  await db.listenLive(queryUuid[0], async ({ action, result }) => {
    if (action === "CLOSE") {
      resultStream.push(null);
      return;
    }
    resultStream.push({ action, result });
  });

  for await (const result of resultStream) {
    if (!result) {
      break;
    }
    yield result;
  }

  await db.query(`DELETE FROM queryuuids WHERE queryuuid='${queryUuid[0]}';`);
  return;
});

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, chainIdToNetworkName }) => {
    const observedWalletNameSignal = useSignal("Loading name...");
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ cleanup }) => {
      cleanup(async () => {
        await killLiveQuery(queryUuid.value);
      });

      if (!observedWallet.id) throw new Error("observedWallet.id is undefined");

      const data = await observedWalletNameLiveStream(observedWallet.id);
      const queryUuid = await data.next();

      observedWalletNameSignal.value = (await data.next()).value;

      for await (const value of data) {
        if (value.action === "CREATE" || value.action === "UPDATE") {
          observedWalletNameSignal.value = value.result.name;
        } else if (value.action === "DELETE") {
          observedWalletNameSignal.value = "";
        }
      }
    });

    const selectedWalletDetails = useContext(SelectedWalletDetailsContext);
    const observedWalletNameContext = useContext(SelectedWalletNameContext);
    // const observedWalletNameSignal = useSignal("Loading name...");

    return (
      <div
        class="flex h-14 cursor-pointer items-center justify-between rounded-lg"
        onClick$={() => {
          selectedWalletDetails.value = observedWallet;
          observedWalletNameContext.value = "example name";
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
