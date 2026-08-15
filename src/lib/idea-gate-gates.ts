export const GATES = [
  {
    key: "relevant",
    title: "Relevant",
    question:
      "Is this actually relevant right now — to the work/life arc you're in, not a random topic because it might get views?",
  },
  {
    key: "not_overplayed",
    title: "Not overplayed",
    question:
      "How many people are already saying this? Is the take too generic, or already flooded?",
  },
  {
    key: "have_a_say",
    title: "You have a say",
    question:
      "Do you actually have standing on this — lived it, built it, paid for it, measured it — or are you cosplaying authority?",
  },
  {
    key: "survives_without_flex",
    title: "Survives without the personal flex",
    question:
      "If you said this without making it about you as a flex, is the information still strong enough to matter?",
  },
  {
    key: "connected_to_work",
    title: "Connected to what you do",
    question:
      "Does this connect to what you actually do — build, ship, market, live this week — not a detached commentary lane?",
  },
  {
    key: "poured_thought",
    title: "Poured thought",
    question:
      "Is this something you've actually thought through — your own pile of thoughts — or just an idea you heard and are repeating?",
  },
  {
    key: "only_you",
    title: "Only you could have written this",
    question:
      "Is there a line, detail, or proof inside the idea that only you could have written or said?",
  },
  {
    key: "sendable",
    title: "Sendable",
    question:
      "Would someone actually forward this to a specific other person — \"you need to see this\"?",
  },
  {
    key: "polarity",
    title: "Polarity",
    question:
      "Does this take a side, create tension, have a spine — or is it safe mush everyone agrees with and forgets?",
  },
  {
    key: "fingerprint",
    title: "Your fingerprint",
    question:
      "If your name were removed, could someone still tell it was you — voice, life, specifics, posture?",
  },
] as const;

export type GateKey = (typeof GATES)[number]["key"];

export type GateAnswer = {
  key: GateKey;
  pass: boolean;
  proof: string;
};
