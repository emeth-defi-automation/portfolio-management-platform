import { component$, Slot } from "@builder.io/qwik";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";

export interface FormBadge2Props {
  tokenName?: string;
  tokenSymbol?: string;
  tokenPath?: string;
}

export const FormBadge2 = component$<FormBadge2Props>((props) => {
  return (
    <label
      class={`has-[:checked]:gradient-border group block select-none rounded-lg border border-white/10 p-2`}
    >
      <ParagraphAnnotation
        paragraphText={props.tokenName}
        annotationText={props.tokenSymbol}
        variant="annotationBelow"
        iconBoxTokenPath={props.tokenPath}
        iconBoxBackground="white3"
        iconBoxSize="large"
        hasIconBox={true}
        iconBoxCustomClass="group-has-[:checked]:gradient-border"
      >
        <Slot />
      </ParagraphAnnotation>
    </label>
  );
});
