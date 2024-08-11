import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
1. Please make sure LockDown Browser is installed correctly and that your device passes the system check.
2. Check your camera and microphone permissions and ensure there are no conflicting programs running.
3. Start your test by following the on-screen instructions, and remember to stay within the camera's view.
4. If you encounter an issue, try restarting the browser. Contact support if the problem persists.
5. You can review your test results through the platform once your session is complete.
`;

export async function POST(req) {
  const data = await req.json();
  const openai = new OpenAI();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  

  const stream = new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder(); 
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            const encodedText = encoder.encode(text);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}