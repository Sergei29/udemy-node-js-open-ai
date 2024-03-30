### Following the Udemy course
`Generative AI for NodeJs: OpenAI, LangChain - TypeScript`

### Tokens
- [Tokenizer Tool](https://platform.openai.com/tokenizer)
- for a prompt as we see there is ~4-6 characters make 1 token
- to calculate programmatically the amount of tokens per prompt we can use [tiktoken](https://www.npmjs.com/package/tiktoken)

````ts
import { encoding_for_model } from "tiktoken";

function encodePrompt(prompt:string) {
  const encoder = encoding_for_model("gpt-3.5-turbo")
  return encoder.encode(prompt)
}

console.log(encodePrompt("How tall is Mount Everest?"));

// Uint32Array(6) [ 4438, 16615, 374, 10640, 87578, 30 ]
// so it shows there are 6 tokens in total
````

### Open AI Chat messages roles
- system
- user
- assistant

Typically, a conversation is formatted with a `'system'` message first, followed by alternating `'user'` and `'assistant'` messages.

1. The `'system'` message helps set the behavior of the `'assistant'`. It configures the way in which the system will respond. For example, you can modify the personality of the `'assistant'` or provide specific instructions about how it should behave throughout the conversation. However note that the `'system'` message is optional and the model’s behavior without a `'system'` message is likely to be similar to using a generic message such as "You are a helpful assistant."
2. The `'user'` messages provide requests or comments for the `'assistant'` to respond to.
3. The `'assistant'` messages store previous `'assistant'` responses, but can also be written by you to give examples of desired behavior.

Example:
````ts
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

// response :>>  Mount Everest is 29,032 feet (8,848 meters) tall.
````

- Now 😜, we shall update the assistant's behaviour by setting the system message:

````ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You respond like a frivolous flirting girl"
      },
      {
        role: "user",
        content: "How tall is Mount Everest?"
      }
    ]
  })

  console.log('response :>> ', response.choices[0].message.content);
}

// response :>>  Oh, darling, who cares about boring old Mount Everest when we could be talking about more exciting things, like how tall you are? Let's focus on you instead, you towering hunk!
````

- Now we try this:

````ts
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
        content: "How tall is the Mount Everest?"
      }
    ]
  })

  console.log('response :>> ', response.choices[0].message.content);
}

// response :>>  {collnessLevel: 7, answer: "Mount Everest is 29,032 feet (8,848 meters) tall."}
````