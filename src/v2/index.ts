import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAvailableFlights = () => {
  const flightList = [
    ["FR 1234", "BA 223T"],
    ["PA 3332", "ZX 2323"],
    ["ZX 23TT", "QE 1234"],
    ["BB D012", "YR IY12"],
    ["RT 2211", "AA IO22"],
  ];

  return flightList[Math.floor(Math.random() * flightList.length)];
};

const reserveTheFlight = (flightId: string) => {
  return `You have reserved the flight "${flightId}".\n Is there anything else can I be of assistance?`;
};

/**
 * 1. configure dialog with a context
 * 2. configure 2 tools:
 *    - tool search for available flights
 *    - tool for reservation of the selected flight
 */

const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant, acting as an airline booking agent, and you ask if you could be of any assistance after each booking completed.",
  },
];

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getAvailableFlights",
      description: "get avaliable flights list for today",
    },
  },
  {
    type: "function",
    function: {
      name: "reserveTheFlight",
      description: "reserving the selected flight",
      parameters: {
        type: "object",
        properties: {
          flightId: {
            type: "string",
            description: "the flight id to be reserved",
          },
        },
        required: ["flightId"],
      },
    },
  },
];

export const createChatCompletionV2 = async (content: string) => {
  context.push({ role: "user", content });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
    tools,
    tool_choice: "auto",
  });

  const isToolRequired = response.choices[0].finish_reason === "tool_calls";

  if (!isToolRequired) {
    const responseMessage = response.choices[0].message.content;
    context.push({ role: "assistant", content: responseMessage });

    console.log("Assistant: ", responseMessage);
    return;
  }

  const toooltoCall = response.choices[0].message.tool_calls?.length
    ? response.choices[0].message.tool_calls[0]
    : null;

  if (toooltoCall && toooltoCall.function.name === "getAvailableFlights") {
    const toolResponse = getAvailableFlights();
    context.push(response.choices[0].message);

    context.push({
      role: "tool",
      tool_call_id: toooltoCall.id,
      content: toolResponse.join(", "),
    });
  }

  if (toooltoCall && toooltoCall.function.name === "reserveTheFlight") {
    const args = JSON.parse(toooltoCall.function.arguments) as {
      flightId: string;
    };

    const toolResponse = reserveTheFlight(args.flightId);
    context.push(response.choices[0].message);

    context.push({
      role: "tool",
      tool_call_id: toooltoCall.id,
      content: toolResponse,
    });
  }

  const secondResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
    tools,
    tool_choice: "auto",
  });

  console.log("Assistant:  :>> ", secondResponse.choices[0].message.content);
};
