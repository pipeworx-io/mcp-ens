# mcp-ens

ENS (Ethereum Name Service) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1192+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `resolve_ens` | Resolve an ENS name (e.g. "vitalik.eth") to its Ethereum address and profile records (avatar, description, socials: twitter/github/discord/email/url). Keyless. |
| `reverse_ens` | Reverse-resolve an Ethereum address (0x…) to its primary ENS name and profile records. Keyless. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ens": {
      "url": "https://gateway.pipeworx.io/ens/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1192+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ens data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
