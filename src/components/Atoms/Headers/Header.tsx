import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

export interface HeaderProps {
  title?: string;
  class?: string;
}

const HeaderStyles = cva(
  ["font-['Sora'] font-semibold !leading-none text-nowrap"],
  {
    variants: {
      variant: {
        h1: ["text-4xl"],
        h2: ["text-2xl"],
        h3: ["text-xl"],
        h4: ["text-base"],
        h5: ["text-sm"],
      },
    },
    defaultVariants: {},
  },
);

export type HeaderType = VariantProps<typeof HeaderStyles> & HeaderProps;

const Header = ({ variant, ...props }: HeaderType) => {
  switch (variant) {
    case "h1":
      return (
        <h1 {...props} class={twMerge(HeaderStyles({ variant }), props.class)}>
          {props.title}
        </h1>
      );
    case "h2":
      return (
        <h2 {...props} class={twMerge(HeaderStyles({ variant }), props.class)}>
          {props.title}
        </h2>
      );
    case "h3":
      return (
        <h3 {...props} class={twMerge(HeaderStyles({ variant }), props.class)}>
          {props.title}
        </h3>
      );
    case "h4":
      return (
        <h4 {...props} class={twMerge(HeaderStyles({ variant }), props.class)}>
          {props.title}
        </h4>
      );
    case "h5":
      return (
        <h5 {...props} class={twMerge(HeaderStyles({ variant }), props.class)}>
          {props.title}
        </h5>
      );
  }
};

export default Header;
