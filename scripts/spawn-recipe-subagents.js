#!/usr/bin/env node
/**
 * Recipe Generator - Spawns 8 parallel subagents to generate recipes
 * Run this script to generate 8 recipes in parallel
 */

const API_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';
const API_TOKEN = process.env.OPENCLAW_TOKEN || '1fc64ac8b3cf027c1ec82f6d003fe41c9d23ea70ed86236b';

const recipePrompt = `You are a recipe generator. Your task:

1. Read the recipe schema from: /home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-generator-prompt.md

2. Generate ONE unique, creative recipe following that schema.

Cuisine selection (weighted random):
- Italian: 15%
- Mexican: 15%
- American: 12%
- Asian (Chinese, Japanese, Thai, Vietnamese, Korean): 15%
- Mediterranean (Greek, Spanish, Turkish): 12%
- French: 8%
- Indian: 5%
- Latin American (Brazilian, Peruvian, Argentinian): 8%
- Middle Eastern: 5%
- Caribbean: 5%

IMPORTANT: Do NOT default to Indian cuisine. Track previously used cuisines and ensure variety. Avoid repeating any cuisine within the last 5 generated recipes.

3. Save the generated SQL to a file:
   - Path: /home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-\$(date +%Y-%m-%d-%H-%M).sql
   - Use the actual timestamp in the filename

4. Send a message to this chat with:
   - The recipe name and brief description
   - The full SQL (as a code block)
   - Two inline buttons:
     - [Approve] - callback_data: "approve_recipe"
     - [Reject] - callback_data: "reject_recipe"
   - Text: "New recipe generated! Approve to keep, or reject to discard."

Also vary categories (breakfast, lunch, dinner, snack, dessert) and difficulties (Easy, Medium, Hard).`;

// Variant instructions for each subagent to ensure variety
const variants = [
  'Generate a BREAKFAST recipe, Easy difficulty.',
  'Generate a BREAKFAST recipe, Medium or Hard difficulty.',
  'Generate a LUNCH recipe, Easy difficulty.',
  'Generate a LUNCH recipe, Medium or Hard difficulty.',
  'Generate a DINNER recipe, Easy difficulty.',
  'Generate a DINNER recipe, Medium or Hard difficulty.',
  'Generate a SNACK or DESSERT recipe, any difficulty.',
  'Generate a recipe from a cuisine NOT yet used in this batch.',
];

async function spawnSubagent(index) {
  const sessionKey = `recipe-gen-${Date.now()}-${index}`;
  
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      runtime: 'subagent',
      agentId: 'main',
      label: sessionKey,
      task: `${recipePrompt}\n\n${variants[index]}`,
      model: 'minimax/MiniMax-M2.5',
      timeoutSeconds: 900,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to spawn subagent ${index}:`, error);
    return null;
  }

  const data = await response.json();
  console.log(`Spawned subagent ${index}:`, data.sessionKey || data.id);
  return data.sessionKey || data.id;
}

async function main() {
  console.log(`Starting ${new Date().toISOString()}`);
  console.log('Spawning 8 parallel recipe generators...');
  
  const startTime = Date.now();
  
  // Spawn all 8 subagents in parallel
  const promises = Array.from({ length: 8 }, (_, i) => spawnSubagent(i));
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r !== null).length;
  const duration = Date.now() - startTime;
  
  console.log(`\nCompleted in ${duration}ms`);
  console.log(`Successfully spawned: ${successful}/8 subagents`);
  console.log('Session keys:', results);
}

main().catch(console.error);
