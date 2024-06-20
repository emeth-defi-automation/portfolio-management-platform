import { component$, Slot } from "@builder.io/qwik";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";

export interface FormBadge2Props {
  tokenName?: string;
  tokenSymbol?: string;
  tokenPath?: string;
}

export const FormBadge2 = component$<FormBadge2Props>((props) => {
  return (
    <label class="block rounded-lg border border-white/10 p-2">
      <ParagraphAnnotation
        paragraphText={props.tokenName}
        annotationText={props.tokenSymbol}
        variant="annotationBelow"
        iconBoxTokenPath={props.tokenPath}
        iconBoxBackground="white3"
        hasIconBox={true}
      >
        <Slot />
      </ParagraphAnnotation>
    </label>
  );
});
