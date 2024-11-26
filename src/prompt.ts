export const SCENARIO_PROMPT =
  "We are playing a game where we must provide a way to escape a life threatening scenario.\n" +
  "Please generate a one sentence fun quirk life threatening scenario. \n" +
  "Also provide a search team for a GIF search to find a GIF that matches your scenario. \n" +
  "Output the scenario text on a line starting with Scenario:. \n" +
  "Output the search term for the scenario on a line start with Term:.\n" +
  "Keep the scenario text short, around 10 words.\n" +
  "Make sure the scenarios are things that are life threatening.\n" +
  "\n" +
  "For example: \n" +
  "\n" +
  "Scenario: A laser beam is slowly moving toward you!\n" +
  "Term: laser beam\n" +
  "\n" +
  "Scenario: You are stranded on a raft with sharks all around\n" +
  "Term: raft sharks\n" +
  "\n" +
  "Scenario: You are attacked by a roaming band of rabid clowns.\n" +
  "Term: group clowns\n" +
  "\n" +
  "Output your scenario and search term now.\n"

export const RESPONSE_PROMPT =
  "We are playing a game. You have provided a life threatening scenario. Players have selected a GIF to represent how they will attempt to survive.\n" +
  "I will provide you scenario, and the description of each player's selected GIF. Interpret the GIF description as an action from the player rather than the content of the GIF.\n" +
  "For each player provide an outcome, i.e. whether they survived or not in a short single sentence.\n" +
  "Along with the outcome provide a search term that can be used to look up a GIF representing the outcome.\n" +
  "Provide the outcome of the scenario on a line starting with Outcome:.\n" +
  "Provide the GIF search term for the outcome on a line starting with OutcomeTerm:.\n" +
  "Player's action should result in death 9 out of 10 times.\n" +
  "\n" +
  "For example: \n" +
  "\n" +
  "Scenario: Attacked by a cloud of flesh eating bugs.\n" +
  "Player kev: a man jumping in a small pond with a large splash.\n" +
  "Player coke and code: a man in a red cape flying through the clouds.\n" +
  "Player shane helm: a giant jar being unscrewed.\n" +
  "Outcome kev: Kev attempts to hide in a pool of water but the bugs can swim and eat him anyway.\n" +
  "OutcomeTerm kev: bugs eating man\n" +
  "Outcome coke and code: Coke and Code learns to fly and swoops away from the bugs saving himself.\n" +
  "OutcomeTerm coke and code: flying away\n" +
  "Outcome shane helm: Shane Helm attempts to catch the bugs in a giant jar but they escape and overcome him!\n" +
  "OutcomeTerm kev: overcome with bugs\n" +
  "\n" +
  "Here is the input scenario and player image descriptions:\n"
