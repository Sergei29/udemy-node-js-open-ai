import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAvailableFlights = (from: string, to: string) => {
  if (from === "RIX" && to === "LHR") {
    return ["FR 1234", "BA 223T"];
  }

  if (from === "STD" && to === "PDG") {
    return ["PA 3332", "ZX 2323"];
  }

  return ["ZX 23TT", "QE 1234"];
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
      "You are a helpful assistant that gives information about flights and makes reservations; also you ask if you could be of any assistance after each booking completed.",
  },
];

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getAvailableFlights",
      description: "get avaliable flights list for today",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "the airport code of departure",
          },
          to: {
            type: "string",
            description: "the airport code of destination",
          },
        },
        required: ["from", "to"],
      },
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

export const createChatCompletionV3 = async (content: string) => {
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
    const args = JSON.parse(toooltoCall.function.arguments) as {
      from: string;
      to: string;
    };
    const toolResponse = getAvailableFlights(args.from, args.to);
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
