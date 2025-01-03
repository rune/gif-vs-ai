import type { GameOverResult, PlayerId, RuneClient } from "rune-sdk"
import { RESPONSE_PROMPT, SCENARIO_PROMPT } from "./prompt"

const PROMPT_TIMER = 10000
const RESPOND_TIMER = 30000
export const OUTCOME_TIMER = 10000

export type GifData = {
  url: string
  meta: string
  name: string
  search: string
  outcome?: string
  outcomeTerm?: string
  outcomeUrl?: string
}

export interface GameState {
  scenario: string
  scenarioGif: string
  scenarioTerm: string
  activePlayer: string
  responses: Record<string, GifData>
  survived: Record<string, boolean>
  started: boolean
  timerTotalTime: number
  timerEndsAt: number
  timerName: string
  prompting: boolean
  playerOrder: string[]
  ready: Record<string, boolean>
}

type GameActions = {
  respond: (gif: GifData) => void
  setScenarioGif: (url: string) => void
  setOutcomeGif: (params: { id: string; url: string }) => void
  start: () => void
  ready: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

function startTimer(game: GameState, name: string, length: number) {
  game.timerName = name
  game.timerTotalTime = length
  game.timerEndsAt = Rune.gameTime() + length
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: (allPlayerIds) => {
    return {
      scenario: "",
      scenarioGif: "",
      scenarioTerm: "",
      activePlayer: allPlayerIds[0],
      started: false,
      timerEndsAt: 0,
      timerName: "",
      timerTotalTime: 0,
      responses: {},
      prompting: false,
      playerOrder: [],
      ready: {},
      survived: {},
    }
  },
  updatesPerSecond: 10,
  update: ({ game, allPlayerIds }) => {
    // run timers
    if (Rune.gameTime() > game.timerEndsAt && game.timerEndsAt !== 0) {
      if (game.timerName === "prompt") {
        startTimer(game, "respond", RESPOND_TIMER)
      } else if (game.timerName === "respond") {
        game.timerEndsAt = 0
        game.timerName = ""

        let input = "Scenario: " + game.scenario + "\n"
        for (const key in game.responses) {
          const response = game.responses[key]

          input += "Player " + response.name + ": " + response.meta + "\n"
        }

        game.prompting = true
        Rune.ai.promptRequest({
          messages: [{ role: "user", content: RESPONSE_PROMPT + input }],
        })
      } else if (game.timerName === "outcome") {
        const players: Record<PlayerId, GameOverResult> = {}
        for (const id of allPlayerIds) {
          players[id] = game.survived[id] ? "WON" : "LOST"
        }
        Rune.gameOver({ players, minimizePopUp: true })
      }
    }
  },
  ai: {
    promptResponse: ({ response }, { game }) => {
      let outcome = false
      const lines = response.split("\n")
      for (const line of lines) {
        if (line.startsWith("Scenario:")) {
          game.scenario = line.substring(line.indexOf(":") + 1).trim()
        }
        if (line.startsWith("Term:")) {
          game.scenarioTerm = line.substring(line.indexOf(":") + 1).trim()
          startTimer(game, "prompt", PROMPT_TIMER)
        }
        if (line.startsWith("Outcome ")) {
          const name = line
            .substring(line.indexOf(" ") + 1, line.indexOf(":"))
            .trim()
          for (const id in game.responses) {
            const response = game.responses[id]
            if (response.name.toLowerCase() === name.toLowerCase()) {
              response.outcome = line.substring(line.indexOf(":") + 1).trim()
              game.playerOrder.push(id)
            }
          }
          game.prompting = false
          outcome = true
        }
        if (line.startsWith("OutcomeTerm")) {
          const name = line
            .substring(line.indexOf(" ") + 1, line.indexOf(":"))
            .trim()
          for (const id in game.responses) {
            const response = game.responses[id]
            if (response.name.toLowerCase() === name.toLowerCase()) {
              response.outcomeTerm = line
                .substring(line.indexOf(":") + 1)
                .trim()
            }
          }
          game.prompting = false
          outcome = true
        }
        if (line.startsWith("Survived")) {
          const name = line
            .substring(line.indexOf(" ") + 1, line.indexOf(":"))
            .trim()
          const survived =
            line
              .substring(line.indexOf(":") + 1)
              .trim()
              .toLowerCase() === "yes"
          for (const id in game.responses) {
            const response = game.responses[id]
            if (response.name.toLowerCase() === name.toLowerCase()) {
              game.survived[id] = survived
            }
          }
          game.prompting = false
          outcome = true
        }
      }

      if (outcome) {
        startTimer(game, "outcome", game.playerOrder.length * OUTCOME_TIMER)
      }
    },
  },
  events: {
    playerLeft: (playerId: string, { game, allPlayerIds }) => {
      if (game.activePlayer === playerId && allPlayerIds.length > 0) {
        game.activePlayer = allPlayerIds[0]
      }
    },
  },
  actions: {
    setOutcomeGif: (params, { game }) => {
      if (game.responses[params.id]) {
        game.responses[params.id].outcomeUrl = params.url
      }
    },
    setScenarioGif: (url, { game }) => {
      game.scenarioGif = url
    },
    respond: (data, { game, playerId }) => {
      game.responses[playerId] = data
    },
    start: (_, { game }) => {
      if (!game.started) {
        game.started = true
        Rune.ai.promptRequest({
          messages: [{ role: "user", content: SCENARIO_PROMPT }],
        })
      }
    },
    ready: (_, { game, allPlayerIds, playerId }) => {
      if (game.timerName === "respond") {
        game.ready[playerId] = true
        for (const id of allPlayerIds) {
          if (!game.ready[id]) {
            return
          }
        }

        game.timerEndsAt = Rune.gameTime() + 1000
      }
    },
  },
})
