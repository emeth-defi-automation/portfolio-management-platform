import {
  $,
  component$,
  useSignal,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import * as d3 from "d3";
import {
  axisXFormatter,
  axisYFormatter,
} from "~/utils/portfolio/axisFormatter";
import { Spinner } from "../Spinner/Spinner";
import IconMaximize from "@material-design-icons/svg/filled/open_in_full.svg?jsx";
import IconMinimalize from "@material-design-icons/svg/filled/close_fullscreen.svg?jsx";
import ImgPfButton from "/public/assets/icons/pfButton.svg?jsx";
import Button from "../Atoms/Buttons/Button";
import { _totalPortfolioValue } from "~/routes/app/dashboard/server/getTotalPortfolioValue";
import {
  Period,
  PeriodValues,
} from "~/routes/app/dashboard/server/getPortfolio24hChange";
import { routeLoader$ } from "@builder.io/qwik-city";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Annotation from "../Atoms/Annotation/Annotation";
import Select from "../Atoms/Select/Select";

export interface PortfolioValueProps {
  isPortfolioFullScreen: Signal<boolean>;
}

export const PortfolioValue = component$<PortfolioValueProps>(
  ({ isPortfolioFullScreen }) => {
    const totalPortfolioValue = useSignal("0");
    const dataForChart = useSignal<[string, number][]>();
    const selectedPeriodForChart = useSignal<Period>(Period.DAY);
    const isDataForChartLoading = useSignal(true);
    const outputRef = useSignal<Element>();
    const percentageChange = useSignal("");
    const change = useSignal("");

    const chart = $((chartData: [string, number][] | undefined) => {
      if (!chartData) return;
      const data: [Date, number][] = [];

      chartData.forEach((d) => {
        data.push([new Date(d[0]), d[1]]);
      });

      const max =
        data.reduce(
          (acc, curr) => Math.max(acc, curr[1]),
          Number.NEGATIVE_INFINITY,
        ) * 1.001;
      const min =
        data.reduce(
          (acc, curr) => Math.min(acc, curr[1]),
          Number.POSITIVE_INFINITY,
        ) * 0.999;

      // Declare the chart dimensions and margins.
      const width = outputRef.value?.getBoundingClientRect().width ?? 0;
      const height = outputRef.value?.getBoundingClientRect().height ?? 0;
      const marginTop = 20;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 60;

      // Declare the x (horizontal position) scale.
      const scaleX = d3
        .scaleTime()
        .domain([new Date(data[0][0]), new Date(data[data.length - 1][0])])
        .range([marginLeft, width - marginRight]);

      // Declare the y (vertical position) scale.
      const scaleY = d3
        .scaleLinear()
        .domain([min, max])
        .range([height - marginBottom, marginTop]);

      // Declare the line generator.
      const line = d3
        .line()
        .x((d) => scaleX(d[0]))
        .y((d) => scaleY(d[1]));

      // Create the SVG container.
      const svg = d3.create("svg").attr("width", width).attr("height", height);

      // Add the x-axis.
      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr("opacity", 0.4)
        .call(
          d3
            .axisBottom(scaleX)
            .tickValues(data.map((d) => d[0]))
            .tickFormat((d) =>
              axisXFormatter(d as Date, selectedPeriodForChart.value),
            )
            .tickSize(-height + marginTop + marginBottom)
            .tickPadding(12),
        )
        .call((g) => {
          // manipulate the elements' attrs here
          g.select("path").attr("opacity", 0);
        });

      // Add the y-axis
      svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .attr("opacity", 0.4)
        .call(
          d3
            .axisLeft(scaleY)
            .ticks(5)
            .tickFormat((d) => axisYFormatter(Number(d)))
            .tickSize(-width + marginLeft + marginRight)
            .tickPadding(12),
        )
        .call((g) => {
          // manipulate the elements' attrs here
          g.select("path").attr("opacity", 0);
        });

      svg
        .append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("d", line as any);

      svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => scaleX(d[0]))
        .attr("cy", (d) => scaleY(d[1]))
        .attr("r", 5)
        .attr("fill", "#69b3a2");

      // Append the svg element
      outputRef.value!.replaceChildren(svg.node()!);
    });

    routeLoader$;

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => {
        selectedPeriodForChart.value;
      });
      isDataForChartLoading.value = false;
      const data = await _totalPortfolioValue(selectedPeriodForChart.value);
      dataForChart.value = data.values;
      percentageChange.value =
        (data.percentageChange > 0 ? "+" : "") +
        data.percentageChange.toFixed(2) +
        "%";
      change.value = (data.change > 0 ? "+" : "") + data.change.toFixed(2);
      totalPortfolioValue.value =
        dataForChart.value[dataForChart.value.length - 1][1].toFixed(2);
      await chart(dataForChart.value);
    });

    return (
      <Box
        customClass={`${isDataForChartLoading.value ? "" : "grid gap-4"}  h-full ${!isPortfolioFullScreen.value ? " grid-rows-[52px_32px_1fr]" : "m-10 grid-rows-[52px_32px_1fr_110px]"}`}
      >
        <div class="custom-border-b-1-opacity-5 flex items-center justify-between pb-4">
          <Header variant="h3" text="Portfolio Value" />
          <div class="text-right">
            <h1
              class="custom-text-gradient text-xl font-semibold text-transparent"
              data-testid="portfolio-value"
            >
              {totalPortfolioValue.value === "0"
                ? "Loading..."
                : `$${totalPortfolioValue.value}`}
            </h1>
            {isDataForChartLoading.value ? null : (
              <div>
                {" "}
                <p class="text-xs">
                  {PeriodValues[selectedPeriodForChart.value].label} change:{" "}
                  <span class="text-xs">{change.value} </span>
                  <span class="text-customGreen">{percentageChange.value}</span>
                </p>{" "}
              </div>
            )}
          </div>
        </div>
        {isDataForChartLoading.value ? (
          <div class="flex-column flex h-full items-center justify-center">
            <Spinner isTextVisible={false} />
          </div>
        ) : (
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Annotation transform="upper" text="Value over time" />
              <div class="custom-border-1 flex h-8 items-center gap-2 rounded-lg bg-white/5 p-1">
                <Button
                  text="24h"
                  onClick$={$(() => {
                    selectedPeriodForChart.value = Period.DAY;
                  })}
                  customClass="rounded-lg w-full h-full !px-2 text-xs"
                  variant={
                    selectedPeriodForChart.value === Period.DAY
                      ? "transfer"
                      : "onlyIcon"
                  }
                />
                <Button
                  text="1W"
                  onClick$={$(() => {
                    selectedPeriodForChart.value = Period.WEEK;
                  })}
                  customClass="rounded-lg w-full h-full !px-2 text-xs"
                  variant={
                    selectedPeriodForChart.value === Period.WEEK
                      ? "transfer"
                      : "onlyIcon"
                  }
                />
                <Button
                  text="1M"
                  onClick$={$(() => {
                    selectedPeriodForChart.value = Period.MONTH;
                  })}
                  customClass="rounded-lg w-full h-full !px-2 text-xs"
                  variant={
                    selectedPeriodForChart.value === Period.MONTH
                      ? "transfer"
                      : "onlyIcon"
                  }
                />
                <Button
                  text="1Y"
                  onClick$={$(() => {
                    selectedPeriodForChart.value = Period.YEAR;
                  })}
                  customClass="rounded-lg w-full h-full !px-2 text-xs"
                  variant={
                    selectedPeriodForChart.value === Period.YEAR
                      ? "transfer"
                      : "onlyIcon"
                  }
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Annotation
                transform="upper"
                text="Portfolio"
                class="lg:hidden"
              />
              <Select
                id="portfolioValue"
                name="portfolioValue"
                size="small"
                options={[{ value: "", text: "All" }]}
                selectClass="custom-bg-opacity-5"
              />
              <Button
                customClass="custom-border-1 custom-bg-opacity-5 h-8 items-center rounded-lg px-2 duration-300 ease-in-out hover:scale-110"
                onClick$={() => {
                  isPortfolioFullScreen.value = !isPortfolioFullScreen.value;
                }}
                variant="iconBox"
                leftIcon={
                  !isPortfolioFullScreen.value ? (
                    <IconMaximize class="h-4 w-4" />
                  ) : (
                    <IconMinimalize class="h-4 w-4" />
                  )
                }
                size="small"
              />
            </div>
          </div>
        )}

        {isDataForChartLoading.value ? null : (
          <div id="container" ref={outputRef}></div>
        )}
        {isPortfolioFullScreen.value && !isDataForChartLoading.value && (
          <div class="ml-7">
            <div class="custom-border-1 relative grid h-[84px] grid-rows-2 rounded-lg">
              <div class="pr-timeline row-start-2"></div>
              <Button
                variant="iconBox"
                leftIcon={<ImgPfButton />}
                size="small"
                customClass="absolute left-3/4 top-1/3 !bg-white/10 !px-1"
              />
              <Button
                variant="iconBox"
                leftIcon={<ImgPfButton />}
                size="small"
                customClass="absolute left-2/4 top-1/3 !bg-white/10 !px-1"
              />
            </div>
          </div>
        )}
      </Box>
    );
  },
);
