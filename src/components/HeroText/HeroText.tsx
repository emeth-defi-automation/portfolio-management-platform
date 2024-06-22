import { Slot, component$ } from "@builder.io/qwik";
import Header from "../Atoms/Headers/Header";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";

export interface HeroTextProps {
  title?: string;
  description?: string;
}

export const HeroText = component$<HeroTextProps>((props) => {
  return (
    <div class="flex flex-col items-center justify-center gap-6 text-center">
      <Slot />
      <Header variant="h1" class="font-medium" text={props.title} />
      <Paragraph
        size="base"
        text={props.description}
        class="text-wrap !leading-normal"
      />
    </div>
  );
});
