import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetShadowHostId
} from "plasmo"
import { useEffect, useState } from "react"

import { sanitizeOutput } from "./helpers"
import { writeCode } from "./open-ai-client"

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

    setQuery(target.query.value)
    setCode("")
    setLoading(true)
  }

  return (
    <div
      style={{
        display: open ? "flex" : "none",
        flexDirection: "column",
        backgroundColor: "#ffffffaa",
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        color: "#111111",
        width: "100%"
      }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ margin: 0 }}>Colab with ChatGPT</h2>
        <p>Ask your question, ChatGPT will answer with code.</p>
        <div style={{ width: "100%", display: "flex" }}>
          <input
            style={{ flex: 1, marginRight: 16 }}
            defaultValue={query}
            name="query"
          />
          <button disabled={loading} type="submit">
            {loading ? "Coding..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Popup
