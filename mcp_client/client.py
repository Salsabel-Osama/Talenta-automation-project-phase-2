from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp import ClientSession
import asyncio


class MCPClient:

    def _init_(self):
        self.session = None
        self.streams = None

    async def connect(self):

        server = StdioServerParameters(
            command="python",
            args=["server .py"]
        )

        self.streams = await stdio_client(server)._aenter_()

        read_stream, write_stream = self.streams

        self.session = ClientSession(
            read_stream,
            write_stream
        )

        await self.session.initialize()

    async def list_tools(self):
        return await self.session.list_tools()

    async def call_tool(self, tool_name, arguments):

        return await self.session.call_tool(
            tool_name,
            arguments
        )

    async def list_resources(self):
        return await self.session.list_resources()

    async def read_resource(self, uri):
        return await self.session.read_resource(uri)

    async def close(self):

        if self.session:
            await self.session.aclose()


# ===================================
# Test Client
# ===================================

async def test():

    client = MCPClient()

    await client.connect()

    print("=" * 50)
    print("TOOLS")
    print("=" * 50)

    tools = await client.list_tools()

    for tool in tools.tools:
        print(tool.name)
        print(tool.description)
        print("-" * 40)

    print()

    print("=" * 50)
    print("RESOURCES")
    print("=" * 50)

    resources = await client.list_resources()

    for resource in resources.resources:
        print(resource.uri)

    await client.close()


if _name_ == "_main_":
    asyncio.run(test())