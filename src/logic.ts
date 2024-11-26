import type { RuneClient } from "rune-sdk"

export type GifData = {
  url: string
  meta: string
}

export interface GameState {
  scenario: string
  scenarioGif: string
}

type GameActions = {
  respond: (gif: GifData) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: () => {
    return {
      scenario: "",
      scenarioGif: "",
    }
  },
  actions: {
    respond: () => {
    },
  },
})
