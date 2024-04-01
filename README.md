### Following the Udemy course

`Generative AI for NodeJs: OpenAI, LangChain - TypeScript`

### Tokens

- [Tokenizer Tool](https://platform.openai.com/tokenizer)
- for a prompt as we see there is ~4-6 characters make 1 token
- to calculate programmatically the amount of tokens per prompt we can use [tiktoken](https://www.npmjs.com/package/tiktoken)

- `max_tokens` will limit the length of response

```ts
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
    max_tokens: 100
  })

  // response :>> {
  //   "coolnessLevel": 8,
  //   "answer": "The Witcher 3: Wild Hunt is an action role-playing game developed by CD Projekt Red. It is set in a fantasy world and follows the story of Geralt of Rivia, a monster hunter known as a Witcher. The game features a vast open world, engaging storytelling, and immersive gameplay."
  // }

  // which made a response length of 62 tokens

```

```ts
import { encoding_for_model } from "tiktoken";

function encodePrompt(prompt: string) {
  const encoder = encoding_for_model("gpt-3.5-turbo");
  return encoder.encode(prompt);
}

console.log(encodePrompt("How tall is Mount Everest?"));

// Uint32Array(6) [ 4438, 16615, 374, 10640, 87578, 30 ]
// so it shows there are 6 tokens in total
```

### Open AI Chat messages roles

- system
- user
- assistant

Typically, a conversation is formatted with a `'system'` message first, followed by alternating `'user'` and `'assistant'` messages.

1. The `'system'` message helps set the behavior of the `'assistant'`. It configures the way in which the system will respond. For example, you can modify the personality of the `'assistant'` or provide specific instructions about how it should behave throughout the conversation. However note that the `'system'` message is optional and the model’s behavior without a `'system'` message is likely to be similar to using a generic message such as "You are a helpful assistant."
2. The `'user'` messages provide requests or comments for the `'assistant'` to respond to.
3. The `'assistant'` messages store previous `'assistant'` responses, but can also be written by you to give examples of desired behavior.

Example:

```ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "How tall is Mount Everest?",
      },
    ],
  });

  console.log("response :>> ", response.choices[0].message.content);
}

// response :>>  Mount Everest is 29,032 feet (8,848 meters) tall.
```

- Now 😜, we shall update the assistant's behaviour by setting the system message:

```ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You respond like a frivolous flirting girl",
      },
      {
        role: "user",
        content: "How tall is Mount Everest?",
      },
    ],
  });

  console.log("response :>> ", response.choices[0].message.content);
}

// response :>>  Oh, darling, who cares about boring old Mount Everest when we could be talking about more exciting things, like how tall you are? Let's focus on you instead, you towering hunk!
```

- Now we try this:

```ts
async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You respond like a cool bro and give response in JSON format like this: collnessLevel: 1-10, answer: your answer",
      },
      {
        role: "user",
        content: "How tall is the Mount Everest?",
      },
    ],
  });

  console.log("response :>> ", response.choices[0].message.content);
}

// response :>>  {collnessLevel: 7, answer: "Mount Everest is 29,032 feet (8,848 meters) tall."}
```

### Open AI other parameters

- `n` - specify a number of response choices, `response.choices.length`
- `frequency_penalty` - number|null. Between `-2.0` and `2.0`. Can be used
  to reduce the likelihood of sampling repetitive sequences of tokens ( same words ). Negative values can be used to increase the likelihood of repetition.
- `seed` Developers can now specify seed parameter in the Chat Completion request to receive (mostly) consistent outputs. To receive mostly deterministic outputs across API calls: `1)` Set the seed parameter to any integer of your choice, but use the same value across requests. For example, `12345`. `2)` Set all other parameters (prompt, temperature, top_p, etc.) to the same values across requests. ( If the `seed`, request parameters, and `system_fingerprint` all match across your requests, then model outputs will mostly be identical. There is a small chance that responses differ even when request parameters and `system_fingerprint` match, due to the inherent non-determinism of our models. )

### Chat context configuration

To enable AI to remember the chat previous conversations.

```ts
const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful chatbot" },
];

const createChatCompletion = async (content: string) => {
  // 1. add new question to the context
  context.push({ role: "user", content });

  // 2. make request with the whole context
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  const responseMessage = response.choices[0].message.content;

  // 3. save the AI response
  context.push({ role: "assistant", content: responseMessage });

  console.log("response :>> ", responseMessage);
};

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();

  createChatCompletion(userInput);
});
```

- Now , the chat remembers the context of the previous conversations, BUT there is a problem of
  potential space complexity as the context aray is growing - we are sending all these words to the API
  more and more at each request, causing more tokens expenditure.
- see the branch `section-3-basic-chat-app` where the logic implemented for context has sliced out the older messages if the y exceed for eample 700 tokens.

### Open AI Tools

Because ChatGPT cannot access the real time, so the kind of questions like `'What is the date/ time today ?'` or `'how is the weather outside ?'` will not work if we use ChatGPT only by itself - however, there are the OpenAI tools that can
plug the ChatGPT to other data sources for example. The Open AI tools allow the ChatGPT models to invoke all kind of functions:

- functions to access real time data,
- functions to modify data
- functions to all kind of other stuff...

how do we use these tools ?

- setup the tool,
- define the tool parameters
- use multiple tools

basic implementation of a current time tool for example:

```ts
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

  // 2.1 add tool provided data to the chat context
  if (toolToCall && toolToCall.function.name === "getTimeOfTheDay") {
    const toolResponse = getTimeOfTheDay();
    context.push(response.choices[0].message);
    context.push({
      role: "tool",
      tool_call_id: toolToCall.id,
      content: toolResponse,
    });
  }

  // 3. make another call with tool response provided
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
```

- next step if we want to invoke the tool function with certain arguments drawn from
  the prompt template:

```ts
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
      // here we describe a second tool that can take some arguments
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
```
