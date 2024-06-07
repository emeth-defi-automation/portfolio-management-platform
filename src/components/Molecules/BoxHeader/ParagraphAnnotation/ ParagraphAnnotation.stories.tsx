import Tag from "~/components/Atoms/Tags/Tag";
import ParagraphAnnotation, {
  type ParagraphAnnotationProps,
} from "./ParagraphAnnotation";
import IconSchedule from "@material-design-icons/svg/round/schedule.svg?jsx";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";

export default {
  title: "molecules/ParagraphAnnotation",
  component: ParagraphAnnotation,
};

export function TokenBlock(args: ParagraphAnnotationProps) {
  return <ParagraphAnnotation {...args} />;
}

export function TokenBlock2(args: ParagraphAnnotationProps) {
  return <ParagraphAnnotation {...args} />;
}

export function WalletBlock(args: ParagraphAnnotationProps) {
  return (
    <ParagraphAnnotation {...args}>
      <IconSchedule class="h-4 w-4 fill-customWarning" />
    </ParagraphAnnotation>
  );
}

export function Action(args: ParagraphAnnotationProps) {
  return (
    <ParagraphAnnotation {...args}>
      <Tag
        variant="success"
        isBorder={true}
        text="Success"
        icon={<IconSuccess class="h-4 w-4 fill-customGreen" />}
      />
    </ParagraphAnnotation>
  );
}

TokenBlock.args = {
  hasTokenIcon: true,
  tokenIconBoxSize: "small",
  tokenIconPath: "/public/assets/icons/tokens/btc.svg",
  tokenIconBorder: "default",
  tokenIconBackground: "transprent",
  annotationText: "BTC",
  paragraphText: "Bitcoin",
  variant: "annotationNear",
};

TokenBlock2.args = {
  hasTokenIcon: true,
  tokenIconBoxSize: "large",
  tokenIconPath: "/public/assets/icons/tokens/eth.svg",
  tokenIconBorder: "clear",
  tokenIconBackground: "white",
  annotationText: "ETH",
  paragraphText: "Ethereum",
  variant: "annotationBelow",
};

WalletBlock.args = {
  hasTokenIcon: true,
  tokenIconBoxSize: "small",
  tokenIconPath: "/public/assets/icons/tokens/eth.svg",
  tokenIconBorder: "default",
  tokenIconBackground: "white",
  annotationText: "Ethereum",
  paragraphText: "Treasury WBTC",
  variant: "annotationBelow",
};

Action.args = {
  hasTokenIcon: false,
  annotationText: "6 hours ago",
  paragraphText: "Automation name #1",
  variant: "annotationBelow",
};
