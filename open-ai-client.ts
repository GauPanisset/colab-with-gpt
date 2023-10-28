import OpenAI from "openai"

const openAIApiKey = process.env.PLASMO_PUBLIC_OPENAI_API_KEY
const heliconeApiKey = process.env.PLASMO_PUBLIC_HELICONE_API_KEY

const openAIClient = new OpenAI({
  apiKey: openAIApiKey,
  baseURL: "https://oai.hconeai.com/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${heliconeApiKey}`,
    "Helicone-Cache-Enabled": "true"
  },
  /**
   * TODO disable this param.
   */
  dangerouslyAllowBrowser: true
})

const createPrompt = (
  query: string
): OpenAI.Chat.ChatCompletionMessageParam[] => {
  const systemPrompt = `You are an expert in coding with Python. 
  Your task is to write some code based on what the user ask. Here's what you need to do:
  - Give the Python code snippet which answer the best the question.
  - Your output SHOULD not contain any introduction or explanation, just code.
  - If you can't answer with code or the question is not related to coding, start your output with "[NO-CODE-ANSWER]".`
  const prompt = `The user query is provided below: 
  "${query}"
  Now write the code that helps the user.`

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ]
}

const writeCode = async (query: string) => {
  const messages = createPrompt(query)

  const response = await openAIClient.chat.completions.create({
    model: "gpt-3.5-turbo",
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 1,
    top_p: 1,
    messages
  })

  return response.choices[0].message.content
}

export { openAIClient, writeCode }
