import { createRoute } from "@wisdom-serve/serve";
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({
  baseURL: "http://localhost:11434",
  apiKey: "ollama", // required but ignored
});
export default createRoute({
  routes: [
    {
      path: "/v1/messages",
      controller: async function () {
        const system = this.$body.messages.filter(
          (item: any) => item.role === "system",
        );
        const users = this.$body.messages.filter(
          (item: any) => item.role === "user",
        );
        const others = this.$body.messages.filter(
          (item: any) => !["system", "user"].includes(item.role),
        );
        const messages = [].concat(system, users, others);
        this.$body.messages = messages;
        console.log(this.$body.messages);
        const stream = await anthropic.messages.stream({
          ...this.$body,
          messages,
          // max_tokens: 262144,
          // model: "[限时]claude-sonnet-4-6",
        });
        this.response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        // 立即发送 headers
        this.response.flushHeaders?.();
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            process.stdout.write(event.delta.text);
          }
          this.response.write(`event: ${event.type}\n`);
          this.response.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        this.response.end();
      },
    },
  ],
});
