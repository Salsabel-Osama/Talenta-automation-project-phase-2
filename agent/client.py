import os

import google.generativeai as genai

from mcp import ClientSession
from mcp.client.stdio import (
    stdio_client,
    StdioServerParameters,
)
import mcp.types as types

from config import (
    GEMINI_API_KEY,
    MODEL_NAME,
    TEMPERATURE,
)


# ==================================================
# Gemini Configuration
# ==================================================

genai.configure(
    api_key=GEMINI_API_KEY
)

sampling_model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": TEMPERATURE,
    },
)


class MCPClient:

    def __init__(self):

        self.session = None

        self._stdio_ctx = None

        self._session_ctx = None

    # ==================================================
    # Connection State
    # ==================================================

    @property
    def is_connected(self) -> bool:

        return self.session is not None

    # ==================================================
    # MCP Sampling Callback
    # ==================================================

    async def sampling_callback(
        self,
        *args
    ) -> types.CreateMessageResult:

        params = args[-1]

        print("\n" + "=" * 60)
        print("[MCP] Server requested LLM Sampling")
        print("=" * 60)

        prompt_parts = []

        for message in params.messages:

            content = message.content

            if isinstance(
                content,
                types.TextContent
            ):

                prompt_parts.append(
                    content.text
                )

        prompt = "\n".join(
            prompt_parts
        )

        try:

            response = sampling_model.generate_content(
                prompt
            )

            result_text = (
                response.text.strip()
                if response.text
                else ""
            )

            print(
                f"[Gemini Sampling]\n{result_text}\n"
            )

            return types.CreateMessageResult(
                role="assistant",
                content=types.TextContent(
                    type="text",
                    text=result_text,
                ),
                model=MODEL_NAME,
                stopReason="endTurn",
            )

        except Exception as e:

            print(
                f"[Sampling Error] {e}"
            )

            return types.CreateMessageResult(
                role="assistant",
                content=types.TextContent(
                    type="text",
                    text=(
                        "Unable to process "
                        "sampling request."
                    ),
                ),
                model=MODEL_NAME,
                stopReason="endTurn",
            )

    # ==================================================
    # Connect
    # ==================================================

    async def connect(self):

        if self.is_connected:
            return

        server_path = os.path.normpath(
            os.path.join(
                os.path.dirname(
                    os.path.abspath(__file__)
                ),
                "..",
                "mcp_server",
                "server.py",
            )
        )

        if not os.path.exists(server_path):

            raise FileNotFoundError(
                f"MCP server not found: {server_path}"
            )

        server = StdioServerParameters(
            command="python",
            args=[
                "-u",
                server_path,
            ],
        )

        try:

            self._stdio_ctx = stdio_client(
                server
            )

            (
                read_stream,
                write_stream,
            ) = await self._stdio_ctx.__aenter__()

            self._session_ctx = ClientSession(
                read_stream,
                write_stream,
                sampling_callback=(
                    self.sampling_callback
                ),
            )

            self.session = (
                await self._session_ctx.__aenter__()
            )

            await self.session.initialize()

            print(
                "[MCP] Connected successfully."
            )

        except Exception:

            await self.close()

            raise

    # ==================================================
    # Tools
    # ==================================================

    async def list_tools(self):

        if not self.is_connected:
            raise RuntimeError(
                "MCP client is not connected."
            )

        return await self.session.list_tools()

    async def get_tools(self):

        result = await self.list_tools()

        return result.tools

    async def call_tool(
        self,
        tool_name: str,
        arguments: dict,
    ):

        if not self.is_connected:

            raise RuntimeError(
                "MCP client is not connected."
            )

        print(
            f"[MCP] Calling tool: {tool_name}"
        )

        return await self.session.call_tool(
            tool_name,
            arguments,
        )

    # ==================================================
    # Resources
    # ==================================================

    async def list_resources(self):

        if not self.is_connected:
            raise RuntimeError(
                "MCP client is not connected."
            )

        return await self.session.list_resources()

    async def read_resource(
        self,
        uri: str,
    ):

        if not self.is_connected:
            raise RuntimeError(
                "MCP client is not connected."
            )

        return await self.session.read_resource(
            uri
        )

    # ==================================================
    # Close
    # ==================================================

    async def close(self):

        self.session = None

        if self._session_ctx:

            try:

                await self._session_ctx.__aexit__(
                    None,
                    None,
                    None,
                )

            except Exception as e:

                print(
                    f"[MCP] Session close warning: {e}"
                )

            finally:

                self._session_ctx = None

        if self._stdio_ctx:

            try:

                await self._stdio_ctx.__aexit__(
                    None,
                    None,
                    None,
                )

            except Exception as e:

                print(
                    f"[MCP] STDIO close warning: {e}"
                )

            finally:

                self._stdio_ctx = None


# ==================================================
# MCP Client Test
# ==================================================

async def test():

    client = MCPClient()

    try:

        await client.connect()

        print("\n")
        print("=" * 60)
        print("TOOLS BEFORE HR LOGIN")
        print("=" * 60)

        tools = await client.get_tools()

        for tool in tools:

            print(
                f"- {tool.name}"
            )

        print("\n")
        print("=" * 60)
        print("HR LOGIN")
        print("=" * 60)

        result = await client.call_tool(
            "simulate_hr_login",
            {
                "username": "Youssef",
                "role": "HR_MANAGER",
            },
        )

        print(result)

        print("\n")
        print("=" * 60)
        print("TOOLS AFTER HR LOGIN")
        print("=" * 60)

        tools = await client.get_tools()

        for tool in tools:

            print(
                f"- {tool.name}"
            )

    finally:

        await client.close()


if __name__ == "__main__":

    import asyncio

    asyncio.run(test())