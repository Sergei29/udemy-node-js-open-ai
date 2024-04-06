import { OpenAI } from "openai";

import { createChatCompletionV3 } from "./v3";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// /**
//  * 1. configure dialog with a context
//  * 2. configure 2 tools:
//  *    - tool search for available flights
//  *    - tool for reservation of the selected flight
//  */

// const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
//   {
//     role: "system",
//     content:
//       "You are a helpful assistant acting as an airline flights booking agent",
//   },
// ];

// const getAvailableFlights = () => {
//   const flightList = [
//     ["FR 1234", "BA 223T"],
//     ["PA 3332", "ZX 2323"],
//     ["ZX 23TT", "QE 1234"],
//     ["BB D012", "YR IY12"],
//     ["RT 2211", "AA IO22"],
//   ];

//   return flightList[Math.floor(Math.random() * flightList.length)];
// };

// const reserveTheFlight = (flightId: string) => {
//   return `You have reserved flight "${flightId}"`;
// };

// const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
//   {
//     type: "function",
//     function: {
//       name: "getAvailableFlights",
//       description: "get avaliable flights list for today",
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "reserveTheFlight",
//       description: "makes flight reservation based on flight id provided",
//       parameters: {
//         type: "object",
//         properties: {
//           flightId: {
//             type: "string",
//             description: "the id of the flight to be reserved",
//           },
//         },
//         required: ["flightId"],
//       },
//     },
//   },
// ];

// const createChatCompletion = async (content: string) => {
//   context.push({ role: "user", content });

//   const response = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: context,
//     tools,
//     tool_choice: "auto",
//   });

//   const isToolRequired = response.choices[0].finish_reason === "tool_calls";

//   if (!isToolRequired) {
//     const responseMessage = response.choices[0].message.content;
//     context.push({ role: "assistant", content: responseMessage });
//     console.log("response :>> ", responseMessage);

//     return;
//   }

//   const toolToCall = response.choices[0].message.tool_calls?.length
//     ? response.choices[0].message.tool_calls[0]
//     : null;

//   if (toolToCall && toolToCall.function.name === "getAvailableFlights") {
//     const toolResponse = getAvailableFlights();
//     context.push(response.choices[0].message);
//     context.push({
//       role: "tool",
//       tool_call_id: toolToCall.id,
//       content: toolResponse.join(", "),
//     });
//   }

//   if (toolToCall && toolToCall.function.name === "reserveTheFlight") {
//     const args = JSON.parse(toolToCall.function.arguments) as {
//       flightId: string;
//     };
//     const toolResponse = reserveTheFlight(args.flightId);
//     context.push(response.choices[0].message);
//     context.push({
//       role: "tool",
//       tool_call_id: toolToCall.id,
//       content: toolResponse,
//     });
//   }

//   const secondResponse = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo-0613",
//     messages: context,
//     tools,
//     tool_choice: "auto", // the engine will decide which tool to use
//   });

//   console.log("response :>> ", secondResponse.choices[0].message.content);
// };

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();

  createChatCompletionV3(userInput);
});
