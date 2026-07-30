from mcp.server.fastmcp import FastMCP

mcp = FastMCP("TalentaRecruitmentServer")

if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport")
    mcp.run(transport="stdio")