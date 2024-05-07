import NumberText, { type NumberTextProps } from "./NumberText";

export default {
  title: "atoms/NumberText",
  component: NumberText,
};

export function NumberTextNormal(args: NumberTextProps) {
  return <NumberText {...args} />;
}

export function NumberTextHigh(args: NumberTextProps) {
  return <NumberText {...args} />;
}

export function NumberTextLow(args: NumberTextProps) {
  return <NumberText {...args} />;
}

NumberTextNormal.args = {
  text: "0,00%",
  color: "norlam",
};

NumberTextHigh.args = {
  text: "+3,36%",
  color: "high",
};

NumberTextLow.args = {
  text: "-2.27%",
  color: "low",
};
