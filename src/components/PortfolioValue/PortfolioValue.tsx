import {
  $,
  component$,
  type QRL,
  type Signal,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import IconMaximize from "/public/assets/icons/dashboard/maximize.svg?jsx";
import ImgPfButton from "/public/assets/icons/pfButton.svg?jsx";
import ImgMinimalize from "/public/assets/icons/minimalize.svg?jsx";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import * as d3 from "d3";
import { type PeriodState } from "~/interface/balance/Balance";
import {
  axisXFormatter,
  axisYFormatter,
} from "~/utils/portfolio/axisFormatter";
import { Spinner } from "../Spinner/Spinner";

export interface PortfolioValueProps {
  hideChartWhileLoading: Signal<boolean>;
  redrawChart: boolean;
  totalPortfolioValue: string;
  isPortfolioFullScreen: Signal<boolean>;
  portfolioValueChange: string;
  portfolioPercentageValueChange: string;
  chartData: [string, number][] | undefined;
  onClick$?: QRL<(e: any) => void>;
  selectedPeriod: PeriodState;
  period: string;
  totalPortfolioValueLoading: boolean;
  portfolioValueChangeLoading: Signal<boolean>;
}

export const PortfolioValue = component$<PortfolioValueProps>(
  ({
    totalPortfolioValue,
    isPortfolioFullScreen,
    portfolioValueChange,
    portfolioPercentageValueChange,
    onClick$,
    selectedPeriod,
    chartData,
    period,
    totalPortfolioValueLoading,
    portfolioValueChangeLoading,
    redrawChart,
    hideChartWhileLoading,
  }) => {
    const outputRef = useSignal<Element>();
    const chart = $(() => {
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

      // Define the gradient
      //const gradient = svg.append("defs")
      //  .append("linearGradient")
      //  .attr("id", "gradient")
      //  .attr("x1", "0%")
      //  .attr("y1", "0%")
      //  .attr("x2", "100%")
      //  .attr("y2", "100%");

      //gradient.append("stop")
      //  .attr("offset", "0%")
      //  .attr("stop-color", "blue");

      //gradient.append("stop")
      //  .attr("offset", "100%")
      //  .attr("stop-color", "green");

      // Add the x-axis.
      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr("opacity", 0.4)
        .call(
          d3
            .axisBottom(scaleX)
            .tickValues(data.map((d) => d[0]))
            .tickFormat((d) => axisXFormatter(d as Date, selectedPeriod))
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

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => chartData);
      chart();
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => redrawChart);
      chart();
    });
    return (
      <div
        class={`custom-border-1 custom-bg-opacity-5 ${portfolioValueChangeLoading.value || hideChartWhileLoading.value ? "" : "grid gap-4"}  rounded-2xl p-6 ${!isPortfolioFullScreen.value ? " grid-rows-[52px_32px_1fr]" : "m-10 grid-rows-[52px_32px_1fr_110px]"}`}
      >
        <div class="custom-border-b-1-opacity-5 flex items-center justify-between pb-4">
          <h1 class="text-xl font-semibold">Portfolio Value</h1>
          <div class="text-right">
            <h1 class="custom-text-gradient text-xl font-semibold text-transparent">
              {totalPortfolioValueLoading ||
              portfolioValueChangeLoading.value ||
              hideChartWhileLoading.value
                ? "Loading..."
                : `$${totalPortfolioValue}`}
            </h1>
            {totalPortfolioValueLoading ||
            portfolioValueChangeLoading.value ||
            hideChartWhileLoading.value ? null : (
              <div>
                {" "}
                <p class="text-xs">
                  {period} change: {portfolioValueChange}{" "}
                  <span class="text-customGreen">
                    {portfolioPercentageValueChange}
                  </span>
                </p>{" "}
              </div>
            )}
          </div>
        </div>
        {portfolioValueChangeLoading.value || hideChartWhileLoading.value ? (
          <div class="flex-column flex h-full items-center justify-center">
            <Spinner isTextVisible={false} />
          </div>
        ) : (
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <h3 class="custom-text-50 uppercase">Value over time</h3>
              <div class="custom-bg-opacity-5 custom-border-1 flex h-8 rounded-lg p-1">
                <button
                  name="24h"
                  class={
                    selectedPeriod["24h"]
                      ? "custom-bg-button rounded-lg px-2"
                      : "rounded-lg px-2"
                  }
                  onClick$={onClick$}
                >
                  24h
                </button>
                <button
                  name="1W"
                  class={
                    selectedPeriod["1W"]
                      ? "custom-bg-button rounded-lg px-2"
                      : "rounded-lg px-2"
                  }
                  onClick$={onClick$}
                >
                  1W
                </button>
                <button
                  name="1M"
                  class={
                    selectedPeriod["1M"]
                      ? "custom-bg-button rounded-lg px-2"
                      : "rounded-lg px-2"
                  }
                  onClick$={onClick$}
                >
                  1M
                </button>
                <button
                  name="1Y"
                  class={
                    selectedPeriod["1Y"]
                      ? "custom-bg-button rounded-lg px-2"
                      : "rounded-lg px-2"
                  }
                  onClick$={onClick$}
                >
                  1Y
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <h2 class="custom-text-50 uppercase lg:hidden">Portfolio</h2>
              <button class="custom-border-1 flex h-8 items-center gap-2 rounded-lg custom-bg-opacity-5 px-2">
                <p>All</p>
                <IconArrowDown />
              </button>
              <button
                class="custom-border-1 h-8 items-center rounded-lg custom-bg-opacity-5 px-2 duration-300 ease-in-out hover:scale-110"
                onClick$={() => {
                  isPortfolioFullScreen.value = !isPortfolioFullScreen.value;
                }}
              >
                {!isPortfolioFullScreen.value ? (
                  <IconMaximize />
                ) : (
                  <ImgMinimalize />
                )}
              </button>
            </div>
          </div>
        )}

        {portfolioValueChangeLoading.value ||
        hideChartWhileLoading.value ? null : (
          <div id="container" ref={outputRef}></div>
        )}
        {isPortfolioFullScreen.value &&
          !portfolioValueChangeLoading.value &&
          !hideChartWhileLoading.value && (
            <div class="ml-7">
              <div class="custom-border-1 relative grid h-[84px] grid-rows-2 rounded-lg">
                <div class="pr-timeline row-start-2"></div>
                <button class="custom-border-1 absolute left-3/4 top-1/3 rounded-lg bg-white bg-opacity-10 px-1 py-1.5">
                  <ImgPfButton />
                </button>
                <button class="custom-border-1 absolute left-2/4 top-1/3 rounded-lg bg-white bg-opacity-10 px-1 py-1.5">
                  <ImgPfButton />
                </button>
                {/* <div class="absolute custom-bg-button opacity-20 h-full left-2/4 right-1/4 "></div> */}
              </div>
              <div class="custom-text-50 mt-3 flex justify-between text-xs">
                <span>2011</span>
                <span>2012</span>
                <span>2013</span>
                <span>2014</span>
                <span>2015</span>
                <span>2016</span>
                <span>2017</span>
                <span>2018</span>
                <span>2019</span>
                <span>2020</span>
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
              </div>
            </div>
          )}
      </div>
    );
  },
);
