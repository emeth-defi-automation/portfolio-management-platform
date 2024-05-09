import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import Header from "~/components/Atoms/Headers/Header";
import Button from "~/components/Atoms/Buttons/Button";

export interface BoxHeaderProps {
  class?: string;
  variantHeader: "h1" | "h2" | "h3" | "h4" | "h5" | null;
  title?: string;
  headerClass?: string;
  variantButton:
    | "blue"
    | "transparent"
    | "red"
    | "danger"
    | "gradient"
    | "iconBox"
    | "onlyIcon"
    | null;
  size: "small" | "large" | null;
  text?: string;
  buttonClass?: string;
  leftIcon?: string | null;
  rightIcon?: string | null;
}

const BoxHeaderStyles = cva(["flex items-center justify-between gap-6"]);

export type BoxHeaderType = VariantProps<typeof BoxHeaderStyles> &
  BoxHeaderProps;

const BoxHeader = ({ ...props }: BoxHeaderType) => {
  return (
    <div {...props} class={twMerge(BoxHeaderStyles(), props.class)}>
      <Header
        variant={props.variantHeader}
        text={props.title}
        class={props.headerClass}
      />
      <Button
        variant={props.variantButton}
        size={props.size}
        text={props.text}
        class={props.buttonClass}
        leftIcon={props.leftIcon}
        rightIcon={props.rightIcon}
      />
    </div>
  );
};

export default BoxHeader;
