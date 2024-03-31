import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful chatbot" },
];

const createChatCompletion = async (content: string) => {
  context.push({ role: "user", content });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  const responseMessage = response.choices[0].message.content;

  context.push({ role: "assistant", content: responseMessage });

  console.log("response :>> ", responseMessage);
};

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();

  createChatCompletion(userInput);
});
