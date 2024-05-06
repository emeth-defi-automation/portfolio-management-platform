import Paragraph, { type ParagraphProps } from "./Paragraphs";

export default { title: "atoms/Paragraphs", component: Paragraph };

export function PrimaryParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function SecondaryParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function GreenParagraph(args: ParagraphProps) {
  return <Paragraph {...args} />;
}

export function GradientParagraph(args: ParagraphProps) {
    return <Paragraph {...args} />;
  }

PrimaryParagraph.args = {
    text: "The connection attempt failed. Please click try again and follow the steps to connect in your wallet.",
    variant: "primaryText",
    size: "base",
    weight: "regular"
};

SecondaryParagraph.args = {
    text: "6 hours ago",
    variant: "secondaryText",
    size: "xs",
    weight: "regular"
};

GreenParagraph.args = {
    text: "+3,36%",
    variant: "greenText",
    size: "xs",
    weight: "regular"
};

GradientParagraph.args = {
    text: "$32 311,00",
    variant: "gradientText",
    size: "xl",
    weight: "semiBold",
    class: ""
};
