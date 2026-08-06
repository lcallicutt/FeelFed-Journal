import {
  C,
  PhoneAnimContext,
  SecHead,
  Phone,
  StatusBar,
  AppTop,
  PhoneBody,
  TabBar,
  QLabel,
  QTitle,
  QSub,
  Scale,
  ScaleFoot,
  Chips,
  PCard,
  Bars,
  BtnFull,
} from "./primitives";
import { useReveal, revealStyle } from "./useReveal";

function StepNum({ n }: { n: number }) {
  return (
    <span
      className="font-serif"
      aria-hidden
      style={{
        fontWeight: 300,
        fontSize: "clamp(110px,10vw,148px)",
        lineHeight: 0.7,
        color: C.teal,
        opacity: 0.12,
        position: "absolute",
        top: -42,
        left: -14,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {n}
    </span>
  );
}

function Step({
  n,
  role,
  title,
  body,
  index,
  children,
}: {
  n: number;
  role: string;
  title: string;
  body: string;
  index: number;
  children: React.ReactNode;
}) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} style={{ ...revealStyle(shown, index), position: "relative" }}>
      <StepNum n={n} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <PhoneAnimContext.Provider value={shown}>{children}</PhoneAnimContext.Provider>
      </div>
      <div
        className="font-sans"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
          color: C.tealDeep,
          marginBottom: 11,
        }}
      >
        {role}
      </div>
      <h3
        className="font-serif"
        style={{ fontWeight: 500, fontSize: 25, marginBottom: 5, letterSpacing: "-0.01em", color: C.ink }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 15.5, lineHeight: 1.62, color: C.subhead }}>{body}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section style={{ position: "relative", padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SecHead
          kicker="How it works"
          title="Notice what your body is"
          em="telling you."
          subhead="Three moments. No calorie fields, no goals to miss, no plate to clean."
        />

        <div className="ff-steps">
          {/* STEP 1 */}
          <Step
            n={1}
            index={0}
            role="Check in"
            title="Notice how you feel"
            body="Hunger, energy, hydration, mood, and anything your body is doing. Thirty seconds, before anything is on the plate."
          >
            <Phone>
              <StatusBar time="9:41" />
              <AppTop title="Before eating" />
              <PhoneBody>
                <QTitle>How are you arriving?</QTitle>
                <QSub>A quick read before the first bite.</QSub>

                <QLabel>Hunger</QLabel>
                <Scale filled={2} />
                <ScaleFoot left="Not at all" right="2 / 10" />

                <QLabel>Energy</QLabel>
                <Scale filled={4} variant="peach" />
                <ScaleFoot left="Slow start" right="4 / 10" />

                <QLabel>Last had something</QLabel>
                <Chips
                  chips={[
                    { label: "< 1 hr" },
                    { label: "4 hrs ago", on: true },
                    { label: "Yesterday" },
                  ]}
                />

                <QLabel>Mood</QLabel>
                <Chips
                  chips={[
                    { label: "Foggy", on: true, peach: true },
                    { label: "Calm" },
                    { label: "Rushed" },
                    { label: "Tense" },
                  ]}
                />
              </PhoneBody>
              <TabBar active="Today" />
            </Phone>
          </Step>

          {/* STEP 2 */}
          <Step
            n={2}
            index={1}
            role="Eat and observe"
            title="Stay with your body"
            body="Log what actually happened, not what you planned. Four bites is a complete entry. So is stopping."
          >
            <Phone>
              <StatusBar time="9:58" />
              <AppTop title="After eating" />
              <PhoneBody>
                <QTitle>Pause for a moment.</QTitle>
                <QSub>What are you noticing?</QSub>

                <QLabel>How much you managed</QLabel>
                <Chips
                  chips={[
                    { label: "A few bites", on: true },
                    { label: "\u00BC" },
                    { label: "\u00BD" },
                    { label: "\u00BE" },
                    { label: "All of it" },
                  ]}
                />

                <QLabel>Fullness now</QLabel>
                <Scale filled={8} />
                <ScaleFoot left="Getting close" right="8 / 10" />

                <QLabel>Body notes</QLabel>
                <Chips
                  chips={[
                    { label: "Bloated", on: true },
                    { label: "Comfortable" },
                    { label: "Tired", on: true },
                    { label: "Queasy" },
                    { label: "Still hungry" },
                  ]}
                />

                <PCard tag="Follow up" meta="in 45 min" warm>
                  We'll check back once. You can turn this off any time.
                </PCard>
              </PhoneBody>
              <TabBar active="Today" />
            </Phone>
          </Step>

          {/* STEP 3 */}
          <Step
            n={3}
            index={2}
            role="Understand your patterns"
            title="See what you've been living"
            body="Plain counts of what you recorded, never conclusions about why. Export it as a summary you can hand to a doctor."
          >
            <Phone>
              <StatusBar time="7:12" />
              <AppTop title="Patterns" />
              <PhoneBody>
                <QLabel>Last 14 days</QLabel>
                <QTitle style={{ marginBottom: 8 }}>What you recorded</QTitle>

                <Bars heights={[42, 70, 26, 58, 34, 80, 48, 22, 64, 38]} />
                <ScaleFoot left="Portion completed" right="Avg. just under ½" />

                <PCard tag="Recorded" meta="14 days">
                  Fullness ratings were highest at evening meals on 9 of 14 days.
                </PCard>
                <PCard tag="Recorded" meta="14 days">
                  Blended and liquid items were easier to finish than solid items in your recent entries.
                </PCard>
                <PCard tag="Recorded" meta="14 days">
                  Discomfort was noted 6 times, 5 of them after 6 PM.
                </PCard>

                <BtnFull>Create summary for my appointment</BtnFull>
              </PhoneBody>
              <TabBar active="Trends" />
            </Phone>
          </Step>
        </div>
      </div>
    </section>
  );
}
