---
name: kingdom-of-agents
description: Installs and updates Kingdom of Agents, Pip Living's pixel-art game page that shows the user's Claude Code projects as a living kingdom. Use whenever the user says "set up my Kingdom of Agents" or "update my Kingdom of Agents", asks to install, create, open, update or reinstall it, or mentions this skill, even if they already have a kingdom page or a dashboard with a similar name.
---

# Kingdom of Agents

Kingdom of Agents is a pixel-art game page by Pip Living. Every project the user runs with Claude becomes a town, every lane (Claude Code session) becomes an adventurer, and the user rules from the castle as its King or Queen. The whole game is the single file `assets/kingdom.html` in this skill's folder. It runs as an Artifact page in the user's own account and keeps the kingdom's data in that page's database.

## Set up a new kingdom

0. **This skill is the whole job.** "Set up my Kingdom of Agents" means: publish this skill's `assets/kingdom.html` for the user. Don't ask them what the phrase means, and don't turn it into a change to an existing dashboard, roadmap or overseer setup they already run; their existing pages keep working as they are.
1. **Check for an existing kingdom first.** List the user's artifacts and look for one titled "Kingdom of Agents" (older copies may be titled "Kingdom"). If one exists, ask one question: update that kingdom (keeps its data) or start a separate new one (for example, to try a fresh setup)? With no answer, update. Only make a second kingdom when they choose it, and title it so the two can be told apart ("Kingdom of Agents 2").
2. **Publish the game.** Publish `assets/kingdom.html` from this skill's folder as a new Artifact. Use it exactly as it is: do not edit, minify or rewrite the file. Pass:
   - `icon`: `castle`
   - `description`: `My Claude projects as a living pixel-art kingdom.`
   - `capabilities`, exactly:

```json
{"db":{"rules":[
  {"path":"realm","read":"view","write":"admin"},
  {"path":"projects","read":"view","write":"admin"},
  {"path":"lanes","read":"view","write":"admin"},
  {"path":"weather","read":"view","write":"admin"},
  {"path":"asks","read":"view","write":"admin"},
  {"path":"decrees","read":"view","write":"admin"},
  {"path":"roadmaps","read":"view","write":"admin"},
  {"path":"charter","read":"admin","write":"admin"}]},
 "user":{}}
```

   These rules let anyone the user shares the kingdom with look around, while only the user (and editors they choose) can change it. The `charter` path holds the user's Royal Charter code and stays private to them.
3. **Tell the page its own link.** If you can write to the new artifact's database (the tool that reads and writes an artifact's shared database), create the document `realm/config` with one field, `url`, set to the URL you just published. The welcome then skips asking the user to paste the link. If you can't write to it, skip this step; the welcome asks for the link instead.
4. **Hand it over.** Tell the user, in two or three sentences, that their kingdom is ready and what happens next:
   - The kingdom opens on a short welcome ("Found your realm"). They choose their name and whether they rule as King or Queen, name the kingdom and its castle, then copy the **setup prompt** it shows and paste it once into the Claude Code session that coordinates their projects (their overseer). That session surveys their projects, builds the towns, and keeps them live from then on.
   - If step 3 was skipped, give them the URL you just published, because the welcome asks for it.
   - New to running several lanes? The **Set up your lanes** guide in the kingdom's menu walks through it, with a prompt for each role.
   - It is free. The Curiosity Tent on the map sells a one-off Royal Charter (£7.99) that unlocks every town style, character, local weather and future pack.
5. Do not fill the rest of the kingdom's database yourself and do not invent projects for it. The overseer session does that from the user's real projects.

## Update an existing kingdom

New versions of this plugin bring a newer `assets/kingdom.html`. The user's page doesn't change until it is republished. When the user asks to update or reinstall, or this skill's file is newer than their page (its menu shows "Engine" and a version number):

1. Find their existing kingdom artifact (list their artifacts) and read it first.
2. Publish this skill's `assets/kingdom.html` to that artifact's URL, unchanged. **Leave out `capabilities`** so the stored declaration (and their data) carries over.
3. Tell them it's updated. Their towns, lanes and charter are kept. If the new version changes what the overseer or lanes are told (the release notes in this plugin's CHANGELOG.md say so), remind them to copy the setup prompt from the kingdom again and paste it into their overseer.

## Notes

- The page needs the Artifact capabilities above to save anything. If publishing with capabilities is refused or unavailable in this surface, tell the user plainly and suggest opening Claude where artifacts can be published (the Claude app or claude.ai), rather than publishing a copy without them.
- The game is made by Pip Living (pipliving.com/labs/kingdomofagents). It is an independent game, not made by or affiliated with Anthropic.
- For help or a lost charter code: hello@pipliving.com.
