import styleText from "data-text:~global.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetShadowHostId
} from "plasmo"
import { useEffect, useState } from "react"

import { sanitizeOutput } from "./helpers"
import { writeCode } from "./open-ai-client"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["*://colab.research.google.com/*"],
  world: "MAIN"
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  return document.querySelectorAll("div.cell.code > div.main-content")
}

export const getShadowHostId: PlasmoGetShadowHostId = ({ element }) =>
  `plasmo-${element.getAttribute("id")}`

const Popup: React.FunctionComponent<PlasmoCSUIProps> = ({ anchor }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  /**
   * Show or hide the Chat input only when the anchor is focused.
   */
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          setOpen(anchor.element.parentElement.classList.contains("focused"))
        }
      }
    })

    observer.observe(anchor.element.parentNode, { attributes: true })

    setOpen(anchor.element.parentElement.classList.contains("focused"))

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleWriteCode = async () => {
      const output = sanitizeOutput(await writeCode(query))
      setCode(output)
      setLoading(false)
      window.colab.global.notebook.focusedCell.setText(output)
    }

    if (query) {
      handleWriteCode()
    }
  }, [query])

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      query: { value: string }
    }

    const newQuery = target.query.value
    if (newQuery) {
      setQuery(newQuery)
      setCode("")
      setLoading(true)
    }
  }

  return (
    <div
      className="flex flex-col bg-colab-background p-4 my-4 text-colab-primary w-full shadow-colab"
      style={{
        display: open ? undefined : "none"
      }}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg mb-2">Colab with ChatGPT</h2>
        <p>Type your question below, ChatGPT will answer with code.</p>
        <div className="w-full flex mt-2 items-center">
          <textarea
            className="flex-auto mr-4 bg-colab-background-dark p-2"
            defaultValue={query}
            name="query"
          />
          <button
            disabled={loading}
            type="submit"
            className="hover:bg-white/10 rounded-md p-2">
            {loading ? (
              "Coding..."
            ) : (
              <span className="flex items-center stroke-current fill-none stroke-2">
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="9 10 4 15 9 20" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
                <span>Submit</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Popup
