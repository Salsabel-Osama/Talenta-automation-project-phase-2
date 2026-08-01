from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp import ClientSession
import asyncio
import os


class MCPClient:

    def __init__(self):
        self.session = None
        self._stdio_ctx = None
        self._session_ctx = None

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

        self._session_ctx = ClientSession(read_stream, write_stream)
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
