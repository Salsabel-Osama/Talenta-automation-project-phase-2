from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp import ClientSession
import mcp.types as types
import asyncio
import os
import google.generativeai as genai
from config import GEMINI_API_KEY, MODEL_NAME, TEMPERATURE

genai.configure(api_key=GEMINI_API_KEY)
sampling_model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": TEMPERATURE,
    }
)

class MCPClient:

    def __init__(self):
        self.session = None
        self._stdio_ctx = None
        self._session_ctx = None

    async def sampling_callback(self, *args) -> types.CreateMessageResult:
            params = args[-1]
            
            print("\n" + "-"*50)
            print("[MCP Client] Server requested LLM Sampling...")
            print("-"*50)
            
            prompt = ""
            for msg in params.messages:
                if msg.content.type == "text":
                    prompt += f"{msg.content.text}\n"
            
            try:
                response = sampling_model.generate_content(prompt)
                result_text = response.text.strip()
                print(f"[Gemini Output]: {result_text}\n")
                
                return types.CreateMessageResult(
                    role="assistant",
                    content=types.TextContent(
                        type="text",
                        text=result_text
                    ),
                    model=MODEL_NAME,
                    stopReason="endTurn"
                )
            except Exception as e:
                print(f"[Error in Sampling]: {e}")
                return types.CreateMessageResult(
                    role="assistant",
                    content=types.TextContent(
                        type="text",
                        text="Error processing sampling request."
                    ),
                    model=MODEL_NAME,
                    stopReason="endTurn"
                )

    async def connect(self):
        server_path = os.path.normpath(
            os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "..", "mcp_server", "server.py"
            )
        )

        server = StdioServerParameters(
            command="python",
            args=["-u", server_path]
        )

        self._stdio_ctx = stdio_client(server)
        read_stream, write_stream = await self._stdio_ctx.__aenter__()

        self._session_ctx = ClientSession(
            read_stream, 
            write_stream,
            sampling_callback=self.sampling_callback
        )
        self.session = await self._session_ctx.__aenter__()

        await self.session.initialize()

    async def list_tools(self):
        return await self.session.list_tools()

    async def call_tool(self, tool_name, arguments):
        return await self.session.call_tool(tool_name, arguments)

    async def list_resources(self):
        return await self.session.list_resources()

    async def read_resource(self, uri):
        return await self.session.read_resource(uri)

    async def close(self):
        if self._session_ctx:
            await self._session_ctx.__aexit__(None, None, None)
        if self._stdio_ctx:
            await self._stdio_ctx.__aexit__(None, None, None)


async def test():
    client = MCPClient()
    await client.connect()

    print("=" * 50)
    print("TOOLS BEFORE HR LOGIN")
    print("=" * 50)
    tools = await client.list_tools()
    for tool in tools.tools:
        print(tool.name)

    print()
    print("=" * 50)
    print("HR LOGIN")
    print("=" * 50)
    result = await client.call_tool(
        "simulate_hr_login",
        {"username": "Youssef", "role": "HR_MANAGER"}
    )
    print(result)

    print()
    print("=" * 50)
    print("TOOLS AFTER HR LOGIN")
    print("=" * 50)
    tools = await client.list_tools()
    for tool in tools.tools:
        print(tool.name)

    await client.close()


if __name__ == "__main__":
    asyncio.run(test())