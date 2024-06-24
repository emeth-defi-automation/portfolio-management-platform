import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { PortfolioValue } from "~/components/PortfolioValue/PortfolioValue";
import { TokenRow } from "~/components/Tokens/TokenRow";
import { useNavigate } from "@builder.io/qwik-city";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import { Spinner } from "~/components/Spinner/Spinner";
import { getFavouriteTokens } from "./server";

import Button from "~/components/Atoms/Buttons/Button";
import NoData from "~/components/Molecules/NoData/NoData";
import Box from "~/components/Atoms/Box/Box";
import Annotation from "../../../components/Atoms/Annotation/Annotation";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import Tag from "~/components/Atoms/Tags/Tag";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import IconWarning from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
import BoxHeader from "../../../components/Molecules/BoxHeader/BoxHeader";
export {
  getFavouriteTokens,
  getTotalPortfolioValue,
  getPortfolio24hChange,
  toggleChart,
} from "./server";

export default component$(() => {
  const nav = useNavigate();
  const isPortfolioFullScreen = useSignal(false);
  const favoriteTokenLoading = useSignal(true);
  const favoriteTokens = useSignal<any[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    favoriteTokens.value = await getFavouriteTokens();
    favoriteTokenLoading.value = false;
  });

  return isPortfolioFullScreen.value ? (
    <PortfolioValue isPortfolioFullScreen={isPortfolioFullScreen} />
  ) : (
    <div class="grid grid-rows-[max(440px)_auto] gap-6 p-10">
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-6">
        <PortfolioValue isPortfolioFullScreen={isPortfolioFullScreen} />

        <Box customClass="flex flex-col min-w-max gap-4 h-full">
          <BoxHeader variantHeader="h3" title="Alerts" class="gap-2">
            <Button text="See All" variant="transparent" size="small" />
          </BoxHeader>
          <div class="">
            <ParagraphAnnotation
              paragraphText="Bitcoin share exceeded 20%"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            />
            <ParagraphAnnotation
              paragraphText="Bitcoin share exceeded 20%"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            />
            <ParagraphAnnotation
              paragraphText="Bitcoin share exceeded 20%"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            />
            <ParagraphAnnotation
              paragraphText="Bitcoin share exceeded 20%"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            />
            <ParagraphAnnotation
              paragraphText="Bitcoin share exceeded 20%"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            />
          </div>
        </Box>

        <Box customClass="flex flex-col min-w-max gap-4 h-full">
          <BoxHeader variantHeader="h3" title="Actions" class="gap-2">
            <Button text="See All" variant="transparent" size="small" />
          </BoxHeader>
          <div>
            <ParagraphAnnotation
              paragraphText="Automation name #1"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            >
              <Tag
                text="Success"
                variant="success"
                icon={<IconSuccess class="h-3.5 w-3.5 fill-customGreen" />}
                isBorder={true}
              />
            </ParagraphAnnotation>
            <ParagraphAnnotation
              paragraphText="Automation name #2"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            >
              <Tag
                text="Success"
                variant="success"
                icon={<IconSuccess class="h-3.5 w-3.5 fill-customGreen" />}
                isBorder={true}
              />
            </ParagraphAnnotation>
            <ParagraphAnnotation
              paragraphText="DCA"
              annotationText="1 day ago"
              textBoxClass="py-4"
            >
              <Tag
                text="Warning"
                variant="warning"
                icon={<IconWarning class="h-3.5 w-3.5 fill-customWarning" />}
                isBorder={true}
              />
            </ParagraphAnnotation>
            <ParagraphAnnotation
              paragraphText="Automation name #3"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            >
              <Tag
                text="Success"
                variant="success"
                icon={<IconSuccess class="h-3.5 w-3.5 fill-customGreen" />}
                isBorder={true}
              />
            </ParagraphAnnotation>
            <ParagraphAnnotation
              paragraphText="Automation name #4"
              annotationText="6 hours ago"
              textBoxClass="py-4"
            >
              <Tag
                text="Success"
                variant="success"
                icon={<IconSuccess class="h-3.5 w-3.5 fill-customGreen" />}
                isBorder={true}
              />
            </ParagraphAnnotation>
          </div>
        </Box>
      </div>

      <Box customClass="flex flex-col h-full gap-6">
        <BoxHeader variantHeader="h3" title="Favourite tokens">
          <Button
            text="Go to Portfolio"
            variant="transparent"
            size="small"
            onClick$={() => {
              nav("/app/portfolio");
            }}
          />
        </BoxHeader>

        {favoriteTokenLoading.value ? (
          <div class="flex h-full flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : favoriteTokens.value.length === 0 ? (
          <NoData
            variant="info"
            title="You didn’t choose your favourite tokens"
            description="To display tokens, choose your favorite tokens from the list."
          >
            <Button text="Add Favourite Tokens" size="small" />
          </NoData>
        ) : (
          <div class="flex flex-col gap-4">
            <div class="custom-text-50 grid grid-cols-[18%_10%_15%_18%_10%_10%_12%_8%] items-center gap-2">
              <Annotation text="Token name" transform="upper" />
              <Annotation text="Quantity" transform="upper" />
              <Annotation text="Value" transform="upper" />
              <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-lg bg-white bg-opacity-5 p-1 text-white">
                <button class="custom-bg-button rounded-lg px-2">24h</button>
                <button class="rounded-lg px-2">3d</button>
                <button class="rounded-lg px-2">30d</button>
              </div>
              <Annotation text="Wallet" transform="upper" />
              <Annotation text="Network" transform="upper" />
              <Annotation text="Subportfolio" transform="upper" />
              <Annotation transform="upper" />
            </div>
            <div>
              {favoriteTokens.value[0] &&
                favoriteTokens.value[0].structureBalance.map(
                  async (token: any, index: number) => {
                    const formattedBalance = convertWeiToQuantity(
                      token.balance.balance.toString(),
                      parseInt(token.balance.decimals),
                    );
                    return (
                      <TokenRow
                        key={`id_${index}_${token.balance.name}`}
                        subportfolio={favoriteTokens.value[0].structure.name}
                        tokenName={token.balance.name}
                        tokenSymbol={token.balance.symbol}
                        quantity={formattedBalance}
                        value={(
                          Number(formattedBalance) *
                          Number(token.balance.balanceValueUSD)
                        ).toFixed(2)}
                        wallet={token.wallet.name}
                        networkName={chainIdToNetworkName[token.wallet.chainId]}
                        imagePath={token.balance.imagePath}
                      />
                    );
                  },
                )}
            </div>
          </div>
        )}
      </Box>
    </div>
  );
});
