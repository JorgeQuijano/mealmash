# Technical Plan: MealMash Agent CLI

## Overview

Create a CLI tool that allows LLM agents to interact with MealMash programmatically. This enables:
- Automated recipe creation/management
- Bulk ingredient imports
- Data migrations
- Automated testing
- External agent workflows (e.g., OpenClaw subagents)

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  LLM Agent      │────▶│  MealMash CLI    │────▶│  Supabase   │
│  (OpenClaw,     │     │  (mealmash CLI)  │     │  Database   │
│   Claude Code,  │     │                  │     │             │
│   etc)          │     └────────┬─────────┘     └─────────────┘
└─────────────────┘              │
                                 │
                          ┌──────▼──────┐
                          │  API Layer  │
                          │  (Next.js)  │
                          └─────────────┘
```

---

## Implementation Phases

### Phase 1: Core CLI Tool

**Goal**: Build a standalone CLI that wraps Supabase operations.

**Structure**:
```
mealmash-cli/
├── bin/
│   └── mealmash.js        # Entry point
├── src/
│   ├── commands/
│   │   ├── recipes.ts     # Recipe CRUD
│   │   ├── ingredients.ts # Ingredient CRUD
│   │   ├── auth.ts        # Authentication
│   │   └── admin.ts       # Admin operations
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client
│   │   └── config.ts      # Config management
│   └── index.ts           # CLI framework
├── package.json
└── README.md
```

**Commands to implement**:

| Command | Description | Example |
|---------|-------------|---------|
| `mealmash auth login` | Authenticate with API key | `mealmash auth login <api-key>` |
| `mealmash recipes list` | List all recipes | `mealmash recipes list --limit 10` |
| `mealmash recipes get <id>` | Get recipe by ID | `mealmash recipes get <id>` |
| `mealmash recipes create` | Create recipe (JSON/stdin) | `mealmash recipes create --file recipe.json` |
| `mealmash recipes update <id>` | Update recipe | `mealmash recipes update <id> --file recipe.json` |
| `mealmash recipes delete <id>` | Delete recipe | `mealmash recipes delete <id>` |
| `mealmash ingredients list` | List ingredients | `mealmash ingredients list --search chicken` |
| `mealmash ingredients create` | Create ingredient | `mealmash ingredients create --name "Chicken" --category meat` |
| `mealmash ingredients delete <id>` | Delete ingredient | `mealmash ingredients delete <id>` |
| `mealmash generate recipe` | Generate a recipe via LLM | `mealmash generate recipe --cuisine italian --category dinner` |

**CLI Framework**: Use `commander.js` or `oclif` (recommended for production CLIs)

---

### Phase 2: Agent Authentication

**Goal**: Secure API access for agents.

**Options**:

1. **API Key Authentication** (Recommended for agents)
   - Generate API keys stored in `user_profiles` table
   - Keys hashed with bcrypt
   - Passed via header: `Authorization: Bearer <api-key>`

2. **Service Role Key** (For trusted internal agents)
   - Bypass RLS entirely
   - Use existing `SUPABASE_SERVICE_ROLE_KEY`

**Database Schema Addition**:
```sql
-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,           -- e.g., "OpenClaw Agent"
  key_hash TEXT NOT NULL,       -- bcrypt hash of the key
  key_prefix TEXT NOT NULL,     -- First 8 chars for display
  permissions TEXT[] DEFAULT '{}', -- ['read', 'write', 'admin']
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
```

**CLI Implementation**:
```bash
# Generate an API key (outputs key once)
mealmash auth create-key --name "My Agent"

# Use the key
mealmash auth login --key <api-key>
```

---

### Phase 3: JSON Output & Pipelines

**Goal**: Make CLI output machine-parseable for agent pipelines.

**Features**:
- `--json` flag for all list/get commands
- `--quiet` flag to suppress non-data output
- Exit codes: 0=success, 1=error

**Examples**:
```bash
# Get all recipes as JSON
mealmash recipes list --json | jq '.[0].name'

# Pipe to other tools
mealmash ingredients list --search chicken --json | jq '.[].id' | xargs -I {} mealmash ingredients delete {}

# Use in scripts
if mealmash recipes get $RECIPE_ID --json > /dev/null 2>&1; then
  echo "Recipe exists"
fi
```

---

### Phase 4: Recipe Generation Command

**Goal**: Built-in LLM-powered recipe generation.

**Implementation**:
```bash
mealmash generate recipe --cuisine italian --category dinner --difficulty medium
```

**Flow**:
1. CLI calls configured LLM (OpenAI, Anthropic, etc.)
2. LLM generates recipe JSON
3. CLI validates against schema
4. CLI inserts into database
5. Returns created recipe ID

**Configuration**:
```bash
mealmash config set openai-key $OPENAI_API_KEY
mealmash config set default-model gpt-4
```

---

### Phase 5: Agent-Specific Features

**Goal**: Optimized for LLM agent usage patterns.

**Batch Operations**:
```bash
# Bulk import from JSON file
mealmash recipes import --file recipes.json

# Bulk delete
mealmash recipes delete $(mealmash recipes list --json --quiet | jq -r '.[:5] | .[].id' | tr '\n' ' ')
```

**Watch Mode** (for testing):
```bash
# Watch for changes and trigger callbacks
mealmash watch recipes --on-create "echo 'New recipe: $RECIPE_NAME'"
```

**Webhooks**:
```bash
# Register webhook for events
mealmash webhooks register --event recipe.created --url https://agent.example.com/hook
```

---

## File Structure (Final)

```
mealmash/
├── mealmash-cli/                 # New CLI package
│   ├── bin/
│   │   └── mealmash.js
│   ├── src/
│   │   ├── commands/
│   │   │   ├── auth.ts
│   │   │   ├── recipes.ts
│   │   │   ├── ingredients.ts
│   │   │   ├── generate.ts
│   │   │   └── config.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── api-client.ts
│   │   │   └── llm.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── COMMANDS.md               # Command reference
├── docs/
│   └── AGENT_CLI_PLAN.md         # This file
└── src/
    └── app/
        └── api/
            └── cli/              # CLI HTTP endpoints (optional)
                └── route.ts
```

---

## Documentation Requirements

### 1. README.md (Quick Start)
- Installation
- Authentication setup
- Basic usage examples

### 2. COMMANDS.md (Full Reference)
- Every command with all flags
- Input/output formats
- Examples for each command

### 3. AGENT_INTEGRATION.md
- How to use with OpenClaw
- How to use with Claude Code
- Example agent prompts
- Error handling patterns

### 4. API_SCHEMA.md
- JSON schemas for all entities
- Validation rules

---

## Security Considerations

1. **API Key Rotation**: Allow users to revoke/regenerate keys
2. **Rate Limiting**: Per-key rate limits to prevent abuse
3. **Audit Logging**: Track all CLI operations
4. **Permissions**: Fine-grained read/write/admin per key

---

## Estimated Effort

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | Core CLI with basic CRUD | 4-6 hours |
| 2 | API Key authentication | 2-3 hours |
| 3 | JSON output & pipelines | 1-2 hours |
| 4 | Recipe generation | 2-3 hours |
| 5 | Batch operations | 2 hours |
| **Docs** | Full documentation | 3-4 hours |
| **Total** | | **14-20 hours** |

---

## Future Enhancements

- **Web-based API**: Add REST endpoints for non-CLI agents
- **GraphQL**: For complex queries
- **Plugin System**: Extensible commands
- **Interactive Mode**: REPL for exploration
