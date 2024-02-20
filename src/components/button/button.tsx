import { component$, Slot } from "@builder.io/qwik";
import * as stylex from "@stylexjs/stylex";

export interface ButtonProps {
  styles?: stylex.StyleXStyles;
  isHighlighted?: boolean;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      {...stylex.attrs(
        styles.base,
        props.isHighlighted && styles.highlighted,
        props.styles,
      )}
    >
      <Slot />
    </button>
  );
});

const styles = stylex.create({
  base: {
    color: "green",
    fontSize: 50,
    lineHeight: 1.5,
  },
  highlighted: {
    color: "brown",
  },
});
