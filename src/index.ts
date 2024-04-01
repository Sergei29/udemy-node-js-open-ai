import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const MAX_TOKENS = 700;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const encoder = encoding_for_model("gpt-3.5-turbo");

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful chatbot" },
];

const createChatCompletion = async (content: string) => {
  context.push({ role: "user", content });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    removeOlderMessages();
  }

  const responseMessage = response.choices[0].message.content;

  context.push({ role: "assistant", content: responseMessage });

  console.log("response :>> ", responseMessage);
};

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();

  createChatCompletion(userInput);
});

function removeOlderMessages() {
  let contextLength = getContextLength();

  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];

      if (message.role !== "system") {
        context.splice(i, 1);
        contextLength = getContextLength();
        console.log("New context length :>> ", contextLength);
        break;
      }
    }
  }
}

function getContextLength() {
  return context.reduce((len, current) => {
    if (typeof current.content === "string") {
      len += encoder.encode(current.content).length;
    } else if (Array.isArray(current.content)) {
      current.content.forEach((message) => {
        if (message.type === "text") {
          len += encoder.encode(message.text).length;
        }
      });
    }

    return len;
  }, 0);
}
