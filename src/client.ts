import "./styles.css"
import config from "./assets/key.json"
import { OUTCOME_TIMER } from "./logic"
import musicUrl from "./assets/music.mp3"
import clickUrl from "./assets/click.mp3"

const MUSIC = new Audio()
MUSIC.src = musicUrl
const CLICK = new Audio()
CLICK.src = clickUrl

MUSIC.play()

function div(id: string): HTMLDivElement {
  return document.getElementById(id) as HTMLDivElement
}

function input(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement
}

function img(id: string): HTMLImageElement {
  return document.getElementById(id) as HTMLImageElement
}

async function getGifs(query: string, limit: number) {
  const key = config.key

  const response = await fetch(
    `https://tenor.googleapis.com/v2/search?key=${key}&q=${query}&limit=${limit}`
  )

  const json = await response.json()

  console.log(json)
  return json
}

input("searchInput").addEventListener("keyup", async (e) => {
  if (e.key === "Enter" || e.keyCode === 13) {
    const term = input("searchInput").value.trim()
    if (term.length > 0) {
      const results = await getGifs(term, 10)
      div("searchResults").innerHTML = ""

      for (const result of results.results) {
        const img = document.createElement("img")
        img.src = result.media_formats.tinygif.url
        img.addEventListener("click", () => {
          for (const item of document.getElementsByClassName("selected")) {
            item.classList.remove("selected")
          }
          img.classList.add("selected")
          Rune.actions.respond({
            url: result.media_formats.tinygif.url,
            meta: result.content_description,
            name: localPlayerName,
            search: term,
          })
        })
        div("searchResults").appendChild(img)
      }
    }
  }
})

div("startButton").addEventListener("click", () => {
  MUSIC.play()
  Rune.actions.start()
})

let currentScreen = "startScreen"
let scenarioTerm = ""
let started = false
let scenarioGif = ""
let scenario = ""
let localPlayerName = ""
const requestedOutcome: Record<string, boolean> = {}

function showScreen(screen: string) {
  if (screen !== currentScreen) {
    div(currentScreen).classList.add("disabled")
    div(currentScreen).classList.remove("enabled")

    currentScreen = screen

    div(currentScreen).classList.remove("off")
    div(currentScreen).classList.remove("disabled")
    div(currentScreen).classList.add("enabled")
  }
}

Rune.initClient({
  onChange: ({ game, event, yourPlayerId }) => {
    if (yourPlayerId) {
      localPlayerName = Rune.getPlayerInfo(yourPlayerId).displayName
    }
    if (event && event.name === "stateSync") {
      if (event.isNewGame) {
        showScreen("startScreen")
        div("promptTimerBar").style.width = "0%"
        started = false
      }
    }

    if (game.started && !started) {
      started = true
      showScreen("promptScreen")
    }

    if (game.scenario !== scenario) {
      scenario = game.scenario
      div("scenarioText").innerHTML = game.scenario
    }
    if (game.scenarioGif === "") {
      img("scenarioGifImg").style.display = "none"
    }
    if (game.scenarioGif !== scenarioGif) {
      scenarioGif = game.scenarioGif
      img("scenarioGifImg").src = game.scenarioGif
      img("scenarioGifImg").style.display = "block"
    }

    if (
      scenarioTerm !== game.scenarioTerm &&
      game.activePlayer === yourPlayerId
    ) {
      scenarioTerm = game.scenarioTerm
      getGifs(scenarioTerm, 1).then((results) => {
        Rune.actions.setScenarioGif(
          results.results[0].media_formats.tinygif.url
        )
      })
    }

    for (const id in game.responses) {
      const response = game.responses[id]
      if (response.outcomeTerm && !requestedOutcome[id]) {
        requestedOutcome[id] = true
        getGifs(response.outcomeTerm, 1).then((results) => {
          Rune.actions.setOutcomeGif({
            id,
            url: results.results[0].media_formats.tinygif.url,
          })
        })
      }
    }

    if (game.prompting) {
      showScreen("thinkingScreen")
    }

    const remaining = game.timerEndsAt - Rune.gameTime()
    const percent =
      (1 - Math.max(0, remaining) / game.timerTotalTime) * 82 + "%"
    if (game.timerName === "prompt") {
      showScreen("promptScreen")
      div("promptTimerBar").style.width = percent
    }
    if (game.timerName === "respond") {
      showScreen("responseScreen")
      div("responseTimerBar").style.width = percent
    }
    if (game.timerName === "outcome") {
      showScreen("outcomeScreen")
      const thru = game.playerOrder.length * OUTCOME_TIMER - remaining
      const index = Math.floor(thru / OUTCOME_TIMER)
      if (index < game.playerOrder.length) {
        const playerId = game.playerOrder[index]
        img("avatarImg").src = Rune.getPlayerInfo(playerId).avatarUrl
        div("playerName").innerHTML = Rune.getPlayerInfo(playerId).displayName

        const secondHalf = thru / OUTCOME_TIMER - index > 0.5
        if (secondHalf) {
          div("resultText").style.display = "block"
          div("resultGif").style.display = "block"
        } else {
          div("resultText").style.display = "none"
          div("resultGif").style.display = "none"
        }

        const response = game.responses[game.playerOrder[index]]
        div("resultText").innerHTML = response.outcome ?? ""
        if (img("resultGif").src !== response.outcomeUrl) {
          img("resultGif").src = response.outcomeUrl ?? ""
        }
        if (img("inputGif").src !== response.url) {
          img("inputGif").src = response.url ?? ""
        }
      }
    }
  },
})
