import {
  $,
  component$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PortfolioValue } from "~/components/PortfolioValue/PortfolioValue";
import { ActionAlertMessage } from "~/components/ActionAlertsMessage/ActionAlertsMessage";
import {
  SuccessStatus,
  WarningStatus,
} from "~/components/ActionAlertsMessage/ActionStatus";
import { TokenRow } from "~/components/Tokens/TokenRow";
import { useNavigate } from "@builder.io/qwik-city";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import { Spinner } from "~/components/Spinner/Spinner";
import { NoDataAdded } from "~/components/NoDataAdded/NoDataAdded";
import {
  getFavouriteTokens,
  getTotalPortfolioValue,
  getPortfolio24hChange,
  toggleChart,
} from "./server";
import { type PeriodState } from "~/interface/balance/Balance";
import Button from "~/components/Atoms/Buttons/Button";
import Box from "~/components/Atoms/Box/Box";
import Header from "~/components/Atoms/Headers/Header";
import Annotation from "../../../components/Atoms/Annotation/Annotation";
export {
  getFavouriteTokens,
  getTotalPortfolioValue,
  getPortfolio24hChange,
  toggleChart,
} from "./server";

export default component$(() => {
  const nav = useNavigate();
  const isPortfolioFullScreen = useSignal(false);
  const totalPortfolioValue = useSignal("0");
  const totalPortfolioValueLoading = useSignal(true);
  const portfolioValueChange = useSignal<any>({});
  const portfolioValueChangeLoading = useSignal(true);
  const favoriteTokenLoading = useSignal(true);
  const favoriteTokens = useSignal<any[]>([]);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    favoriteTokens.value = await getFavouriteTokens();
    favoriteTokenLoading.value = false;

    totalPortfolioValue.value = await getTotalPortfolioValue();
    totalPortfolioValueLoading.value = false;

    portfolioValueChange.value = await getPortfolio24hChange();
    portfolioValueChangeLoading.value = false;
  });

  const changePeriod = useSignal(false);
  const selectedPeriod: PeriodState = useStore({
    "24h": true,
    "1W": false,
    "1M": false,
    "1Y": false,
  });

  const togglePeriod = $(function togglePeriod(button: string) {
    for (const key in selectedPeriod) {
      selectedPeriod[key] = false;
    }
    selectedPeriod[button] = true;
  });

  const redrawChart = useSignal<boolean>(false);
  const hideChartWhileLoading = useSignal<boolean>(false);

  useTask$(async ({ track }) => {
    track(async () => {
      selectedPeriod["24h"];
      selectedPeriod["1W"];
      selectedPeriod["1M"];
      selectedPeriod["1Y"];

      if (changePeriod.value !== false) {
        hideChartWhileLoading.value = true;
        const newChartData = await toggleChart(selectedPeriod);
        portfolioValueChange.value.chartData = newChartData.chartData;
        portfolioValueChange.value.period = newChartData.period;
        portfolioValueChange.value.totalValueChange =
          newChartData.totalValueChange;
        portfolioValueChange.value.percentageOfTotalValueChange =
          newChartData.percentageOfTotalValueChange;
        redrawChart.value = !redrawChart.value;
        hideChartWhileLoading.value = false;
      }
    });
  });

  return isPortfolioFullScreen.value ? (
    <PortfolioValue
      hideChartWhileLoading={hideChartWhileLoading}
      redrawChart={redrawChart.value}
      portfolioValueChangeLoading={portfolioValueChangeLoading}
      totalPortfolioValueLoading={totalPortfolioValueLoading.value}
      totalPortfolioValue={totalPortfolioValue.value}
      isPortfolioFullScreen={isPortfolioFullScreen}
      portfolioValueChange={portfolioValueChange.value.totalValueChange}
      portfolioPercentageValueChange={
        portfolioValueChange.value.percentageOfTotalValueChange
      }
      chartData={portfolioValueChange.value.chartData}
      selectedPeriod={selectedPeriod}
      period={portfolioValueChange.value.period}
      onClick$={(e: any) => {
        togglePeriod(e.target.name);
        changePeriod.value = true;
      }}
    />
  ) : (
    <div class="grid grid-rows-[max(460px)_auto] gap-6 p-10">
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-6">
        <PortfolioValue
          hideChartWhileLoading={hideChartWhileLoading}
          redrawChart={redrawChart.value}
          portfolioValueChangeLoading={portfolioValueChangeLoading}
          totalPortfolioValueLoading={totalPortfolioValueLoading.value}
          totalPortfolioValue={totalPortfolioValue.value}
          isPortfolioFullScreen={isPortfolioFullScreen}
          portfolioValueChange={portfolioValueChange.value.totalValueChange}
          portfolioPercentageValueChange={
            portfolioValueChange.value.percentageOfTotalValueChange
          }
          chartData={portfolioValueChange.value.chartData}
          selectedPeriod={selectedPeriod}
          period={portfolioValueChange.value.period}
          onClick$={(e: any) => {
            togglePeriod(e.target.name);
            changePeriod.value = true;
          }}
        />

        <Box customClass="grid min-w-max grid-rows-[32px_1fr] gap-4 h-full">
          <div class="flex items-center justify-between gap-2">
            <Header variant={"h3"} text={"Alerts"} />
            <Button text="See All" variant="transparent" size="small" />
          </div>
          <div>
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
          </div>
        </Box>

        <Box customClass="grid min-w-max grid-rows-[32px_1fr] gap-4 h-full">
          <div class="flex items-center justify-between gap-2">
            <Header variant={"h3"} text={"Actions"} />
            <Button text="See All" variant="transparent" size="small" />
          </div>
          <div>
            <ActionAlertMessage
              title="Automation name #1"
              description="6 hours ago"
            >
              <SuccessStatus />
            </ActionAlertMessage>
            <ActionAlertMessage
              title="Automation name #2"
              description="6 hours ago"
            >
              <SuccessStatus />
            </ActionAlertMessage>
            <ActionAlertMessage title="DCA" description="1 day ago">
              <WarningStatus />
            </ActionAlertMessage>
            <ActionAlertMessage
              title="Automation name #3"
              description="6 hours ago"
            >
              <SuccessStatus />
            </ActionAlertMessage>
            <ActionAlertMessage
              title="Automation name #4"
              description="6 hours ago"
            >
              <SuccessStatus />
            </ActionAlertMessage>
          </div>
        </Box>
      </div>

      <Box customClass="grid grid-row-[32px_1fr] gap-6">
        <div class="flex items-center justify-between">
          <Header variant={"h3"} text={"Favourite tokens"} />
          <Button
            onClick$={() => {
              nav("/app/portfolio");
            }}
            text="Go To Portfolio"
            variant="transparent"
            size="small"
          />
        </div>

        {favoriteTokenLoading.value ? (
          <div class="flex h-full flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : favoriteTokens.value.length === 0 ? (
          <NoDataAdded
            title="You didn’t choose your favourite tokens"
            description="To display tokens, choose your favorite tokens from the list."
            buttonText="Add Favourite Tokens"
          />
        ) : (
          <div class="grid grid-rows-[32px_auto] gap-4">
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
              <Annotation text="" transform="upper" />
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
