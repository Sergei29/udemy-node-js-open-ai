import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTimeOfTheDay = () => {
  return new Date().toTimeString();
};

const getOrderStatus = (orderId: string) => {
  console.log(`Getting the status of order: ${orderId}...`);

  if (parseInt(orderId) % 2 === 0) {
    return "IN PROGRESS";
  }

  return "COMPLETED";
};

const callOpenAIWithTools = async () => {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the current time, date, location and also the order status",
    },
    { role: "user", content: "What is the status of order 1234 ?" },
  ];

  // 1. 1st call, attempt to get the real-time info
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfTheDay",
          description: "Get the current time",
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the order status by order id",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "the id of the order to get the status of",
              },
            },
            required: ["orderId"],
          },
        },
      },
    ],
    tool_choice: "auto", // the engine will decide which tool to use
  });

  // 2. decide if the tool call is required:
  const isToolRequired = response.choices[0].finish_reason === "tool_calls";
  const toolToCall =
    isToolRequired && response.choices[0].message.tool_calls?.length
      ? response.choices[0].message.tool_calls[0]
      : null;

  if (toolToCall && toolToCall.function.name === "getTimeOfTheDay") {
    const toolResponse = getTimeOfTheDay();

    context.push(response.choices[0].message);
    context.push({
      role: "tool",
      tool_call_id: toolToCall.id,
      content: toolResponse,
    });
  }

  if (toolToCall && toolToCall.function.name === "getOrderStatus") {
    const rawArgument = toolToCall.function.arguments;
    const parsedArgs = JSON.parse(rawArgument) as { orderId: string };

    const toolResponse = getOrderStatus(parsedArgs.orderId);

    context.push(response.choices[0].message);
    context.push({
      role: "tool",
      tool_call_id: toolToCall.id,
      content: toolResponse,
    });
  }

  const secondResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfTheDay",
          description: "Get the current time",
        },
      },
    ],
    tool_choice: "auto", // the engine will decide which tool to use
  });

  console.log("response :>> ", secondResponse.choices[0].message.content);
};

callOpenAIWithTools();
