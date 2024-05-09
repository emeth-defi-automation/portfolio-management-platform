import Paragraph, { type ParagraphProps } from "./Paragraphs";

export default { title: "atoms/Paragraphs", component: Paragraph };

export function PrimaryParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function MediumParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function SecondaryParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function GradientParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

PrimaryParagraph.args = {
  text: "The connection attempt failed. Please click try again and follow the steps to connect in your wallet.",
  variant: "primaryText",
  size: "base",
  weight: "regular",
};

MediumParagraph.args = {
  text: "Bitcoin share exceeded 20%",
  variant: "primaryText",
  size: "sm",
  weight: "medium",
};

SecondaryParagraph.args = {
  text: "Take actions in order to receive first alerts",
  variant: "secondaryText",
  size: "xs",
  weight: "regular",
};

GradientParagraph.args = {
  text: "$32 311,00",
  variant: "gradientText",
  size: "xl",
  weight: "semiBold",
};
