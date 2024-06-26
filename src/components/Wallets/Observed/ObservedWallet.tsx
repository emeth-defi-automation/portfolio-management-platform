import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import IconSchedule from "@material-design-icons/svg/round/schedule.svg?jsx";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Readable } from "stream";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import { killLiveQuery } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { connectToDB } from "~/database/db";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import { type Wallet } from "~/interface/auth/Wallet";

interface ObservedWalletProps {
  observedWallet: Wallet;
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
      <ParagraphAnnotation
        paragraphText={observedWalletNameSignal.value}
        annotationText={chainIdToNetworkName[observedWallet.chainId]}
        onClick$={() => {
          selectedWalletDetails.value = observedWallet;
          observedWalletNameContext.value = observedWalletNameSignal.value;
        }}
        hasIconBox={true}
        iconBoxSize="small"
        iconBoxCustomIcon={<IconEthereum class="h-full w-full" />}
        textBoxClass="py-4"
      >
        <IconSchedule class="h-5 w-5 fill-customWarning" />
      </ParagraphAnnotation>
    );
  },
);
