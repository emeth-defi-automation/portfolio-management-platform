import Annotation, { type AnnotationProps } from "./Annotation";

export default {
  title: "atoms/Annotation",
  component: Annotation,
};

export function AnnotationNormal(args: AnnotationProps) {
  return <Annotation {...args} />;
}

export function AnnotationUppercase(args: AnnotationProps) {
  return <Annotation {...args} />;
}

export function AnnotationWhite(args: AnnotationProps) {
  return <Annotation {...args} />;
}

AnnotationNormal.args = {
  text: "To view the chart, set up your wallets and deposit funds.",
};

AnnotationUppercase.args = {
  text: "Portfolio",
  transform: "upper",
};

AnnotationWhite.args = {
  text: "©2024 Golem Network. All rights reserved.",
  class: "!text-white",
};
