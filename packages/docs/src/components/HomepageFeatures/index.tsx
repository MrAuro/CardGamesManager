import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Poker Game Management",
    Svg: require("@site/static/img/poker.svg").default,
    description: (
      <>
        Keep your poker games organized and fair with detailed hand descriptions and accurate
        tracking. Never lose track of bets and sidepots again.
      </>
    ),
  },
  {
    title: "Blackjack Dealer Assistance",
    Svg: require("@site/static/img/blackjack.svg").default,
    description: (
      <>
        Get real-time dealer instructions, automatic payout calculations, and sidebet management.
        Make your blackjack games run smoother than ever.
      </>
    ),
  },
  {
    title: "AI Card Recognition",
    Svg: require("@site/static/img/ai_card_recognition.svg").default,
    description: (
      <>
        Leverage advanced AI to recognize cards and suits instantly, reducing manual input and
        potential errors. Speed up your game management.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
