import "./styles.css"
import config from "./assets/key.json"

function div(id: string): HTMLDivElement {
  return document.getElementById(id) as HTMLDivElement
}

function img(id: string): HTMLImageElement | undefined {
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

const results = await getGifs("lazer cat", 10)

for (const result of results.results) {
  const img = document.createElement("img")
  img.src = result.media_formats.tinygif.url
  div("searchResults").appendChild(img)
}

Rune.initClient({
  onChange: () => {},
})
