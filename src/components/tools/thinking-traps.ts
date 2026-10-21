// Common CBT thinking traps, in plain English (PROJECT_SPEC §4.2).
export const THINKING_TRAPS = [
  { id: "all-or-nothing", label: "All-or-nothing", hint: "Seeing things as total success or total failure, with nothing in between." },
  { id: "mind-reading", label: "Mind reading", hint: "Assuming you know what others think of you — usually the worst." },
  { id: "fortune-telling", label: "Fortune telling", hint: "Predicting things will go badly before they've happened." },
  { id: "catastrophising", label: "Catastrophising", hint: "Jumping to the worst possible outcome and treating it as likely." },
  { id: "labelling", label: "Labelling", hint: "Putting a harsh label on yourself (\"I'm a loser\") instead of describing what happened." },
  { id: "should-statements", label: "Should statements", hint: "Rigid rules like \"I should look a certain way\" that set you up to feel bad." },
  { id: "emotional-reasoning", label: "Emotional reasoning", hint: "\"I feel it, so it must be true\" — treating feelings as facts." },
  { id: "discounting-positive", label: "Discounting the positive", hint: "Brushing off good things as luck or not counting." },
  { id: "spotlight-effect", label: "Spotlight effect", hint: "Believing everyone is noticing you far more than they really are." },
] as const;

export const trapLabel = (id: string) => THINKING_TRAPS.find((t) => t.id === id)?.label ?? id;

export const COMMON_EMOTIONS = ["Anxious", "Embarrassed", "Sad", "Frustrated", "Ashamed", "Lonely", "Angry", "Hopeless"];
