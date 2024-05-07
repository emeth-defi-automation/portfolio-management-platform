import SpanText, { type SpanTextProps } from "./SpanText";

export default {
  title: "atoms/SpanText",
  component: SpanText,
};

export function SpanTextNormal(args: SpanTextProps) {
  return <SpanText {...args} />;
}

export function SpanTextUppercase(args: SpanTextProps) {
  return <SpanText {...args} />;
}

SpanTextNormal.args = {
  text: "To view the chart, set up your wallets and deposit funds.",
  transform: "norlam",
};

SpanTextUppercase.args = {
  text: "Portfolio",
  transform: "upper",
};
