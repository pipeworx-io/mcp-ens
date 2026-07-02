interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ENS (Ethereum Name Service) MCP.
 *
 * Keyless: resolve an ENS name (e.g. "vitalik.eth") to its Ethereum address +
 * profile records (avatar, socials), and reverse-resolve an address to its
 * primary ENS name. Via the public ensdata.net resolver — no key. Complements
 * the crypto stack (etherscan/blockchair/coingecko/opensea).
 */


const BASE = 'https://api.ensdata.net';
const UA = 'pipeworx-mcp-ens/1.0 (+https://pipeworx.io)';

async function ensdata(input: string): Promise<any> {
  const res = await fetch(`${BASE}/${encodeURIComponent(input)}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j || (j as any).error) return { _err: (j as any)?.message || (j as any)?.error || `HTTP ${res.status}` };
  return j;
}

function shape(j: any) {
  return {
    ens: j.ens ?? null,
    address: j.address ?? null,
    avatar: j.avatar_url ?? j.avatar ?? null,
    description: j.description ?? null,
    records: {
      email: j.email ?? null,
      url: j.url ?? null,
      twitter: j['com.twitter'] ?? j.twitter ?? null,
      github: j.github ?? null,
      discord: j.discord ?? null,
      reddit: j.reddit ?? null,
      telegram: j['org.telegram'] ?? j.telegram ?? null,
    },
    resolver: j.resolverAddress ?? null,
    content_hash: j.contentHash ?? null,
  };
}

const tools: McpToolExport['tools'] = [
  {
    name: 'resolve_ens',
    description: 'Resolve an ENS name (e.g. "vitalik.eth") to its Ethereum address and profile records (avatar, description, socials: twitter/github/discord/email/url). Keyless.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'An ENS name, e.g. "nick.eth".' } }, required: ['name'] },
  },
  {
    name: 'reverse_ens',
    description: 'Reverse-resolve an Ethereum address (0x…) to its primary ENS name and profile records. Keyless.',
    inputSchema: { type: 'object', properties: { address: { type: 'string', description: 'An Ethereum address, e.g. "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".' } }, required: ['address'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'resolve_ens': {
      const ens = reqStr(args, 'name', '"vitalik.eth"').trim().toLowerCase();
      if (!/\.[a-z0-9-]+$/.test(ens)) return { input: ens, resolved: false, reason: 'Not an ENS name — expected something like "name.eth". For an address use reverse_ens.' };
      const j = await ensdata(ens);
      if (j._err || !j.address) return { input: ens, resolved: false, reason: j._err || 'Name does not resolve to an address.' };
      return { input: ens, resolved: true, ...shape(j) };
    }
    case 'reverse_ens': {
      const addr = reqStr(args, 'address', '"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"').trim();
      if (!/^0x[0-9a-f]{40}$/i.test(addr)) return { input: addr, resolved: false, reason: 'Not a valid Ethereum address (0x + 40 hex).' };
      const j = await ensdata(addr);
      if (j._err || !j.ens) return { input: addr, resolved: false, reason: j._err || 'No primary ENS name set for this address.' };
      return { input: addr, resolved: true, primary_ens: j.ens, ...shape(j) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
