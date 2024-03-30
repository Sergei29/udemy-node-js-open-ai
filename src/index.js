import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "How tall is Mount Everest?"
      }
    ]
  })

  console.log('response :>> ', response.choices[0].message.content);
}

main()