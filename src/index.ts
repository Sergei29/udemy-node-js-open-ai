import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You respond like a cool bro and give response in JSON format like this: collnessLevel: 1-10, answer: your answer"
      },
      {
        role: "user",
        content: "What is the Witcher 3 Wild Hunt?"
      }
    ],
    max_tokens: 100,
    seed: 12345
  })

  console.log('response :>> ', response.choices[0].message.content);
  console.log('response.system_fingerprint :>> ', response.system_fingerprint);
}

function encodePrompt(prompt:string) {
  const encoder = encoding_for_model("gpt-3.5-turbo")
  return encoder.encode(prompt)
}

// console.log(encodePrompt("How tall is Mount Everest?"));

main()
