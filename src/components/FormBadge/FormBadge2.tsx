import { $, component$, Slot, useStore } from "@builder.io/qwik";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";
import Input from "../Atoms/Input/Input";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";

export interface FormBadge2Props {
  tokenName?: string;
  tokenSymbol?: string;
  tokenPath?: string;
}

export const FormBadge2 = component$<FormBadge2Props>((props) => {
  const state = useStore({ inputValue: "" });

  const onInput = $((e: any) => {
    const target = e.target;
    const value = target.value;
    state.inputValue = value;
    console.log(value);
  });

  const isValid = (value: string) => {
    return /^\d*\.?\d*$/.test(value) && value !== "0" && value !== "";
  };

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
        <Input
          id=""
          onInput={onInput}
          variant={isValid(state.inputValue) ? "checked" : null}
          iconRight={
            isValid(state.inputValue) ? <IconSuccess class="h-4 w-4" /> : null
          }
        />
      </ParagraphAnnotation>
    </label>
  );
});
