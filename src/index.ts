import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTimeOfTheDay = () => {
  return new Date().toTimeString();
};

const callOpenAIWithTools = async () => {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the current time, date and location",
    },
    { role: "user", content: "What is the time now?" },
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

  const secondResponse = await await openai.chat.completions.create({
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
