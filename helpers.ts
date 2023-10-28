const sanitizeOutput = (output: string) => {
  const errorToken = "[NO-CODE-ANSWER] "

  if (output.startsWith(errorToken) || output.startsWith(`"${errorToken}"`)) {
    return `"""
No code provided by ChatGPT!
Here is the output: 
"${output.replace(errorToken, "")}"
"""`
  }

  return output
    .replace("```python\n", "")
    .replace("```\n", "")
    .replaceAll("```", "")
}

export { sanitizeOutput }
