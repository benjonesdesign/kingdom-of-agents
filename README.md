# Kingdom of Agents

Kingdom of Agents turns the projects you run with Claude Code into a living pixel-art kingdom. Every project becomes a town, every lane (Claude Code session) becomes an adventurer building in it, and you rule from the castle as its King or Queen: answer your lanes' questions, send decrees, watch couriers carry letters between projects, and see each project's roadmap fill as the work lands. The Royal Council in the throne room adds proof marks, laws, quests and a weekly chronicle, and every kind of town has a little mini-game of its own.

It is free to play. A one-off Royal Charter (£7.99), sold inside the game, unlocks every town style, character, local weather and future pack.

Made by [Pip Living](https://www.pipliving.com/labs/kingdomofagents). An independent game, not made by or affiliated with Anthropic.

## Questions

**How many tokens does it use each day?**
The kingdom page itself uses none: it only draws what your own Claude Code sessions write to it. The tokens come from your overseer, the one session that checks on your projects and keeps the kingdom up to date, and they count towards your Claude plan like any other Claude Code work. How much depends on how often it checks and how many projects it looks after:

- A full round, asking each project's Owner what changed, runs every 15 minutes.
- While the kingdom is open, the overseer also takes a quick look every minute for decrees and answers. That stops when you close it.
- Every check re-sends the overseer's conversation, mostly from Claude's cache, so an overseer that has run for days costs more per check than a fresh one.

Your lanes do the same work they would without the kingdom: it only asks them for one-line reports. To see the figure for your own setup, run `/usage` in your overseer session: its Loops section shows the tokens per run, over a day or a week. To use less, give your overseer a slower loop (`/loop 30m …`), close the kingdom when you're not watching, and start a fresh overseer session now and then.

**What Claude plans is it suitable for?**
Any plan that includes Claude Code: Pro, Max, Team or Enterprise. The overseer and your lanes are Claude Code sessions, so the free plan can't run them.

- **Pro**: good for one or two projects with a few lanes. Use a slower overseer loop and close the kingdom when you're not watching.
- **Max**, or a Premium seat on Team or Enterprise: suits several projects with lanes working most of the day, which is what the kingdom is built for.
- **Team and Enterprise**: everyone's overseer and lanes draw on their own seat. Share one kingdom through the Guild Hall in the Royal Council.

## Install

In the Claude app or on claude.ai, open **Customize**, then **Plugins**, and add **Kingdom of Agents**. Before it is listed in the directory you can add it by repository instead: **Plugins > Add > Add marketplace**, then enter `benjonesdesign/kingdom-of-agents`.

In Claude Code:

```
/plugin marketplace add benjonesdesign/kingdom-of-agents
/plugin install kingdom-of-agents@pip-living
```

## Use

1. In a Claude chat, say **"Set up my Kingdom of Agents"**. Claude publishes the game as a private Artifact page in your account.
2. Open the page and follow the welcome: choose your name and whether you rule as King or Queen, name the kingdom and its castle, then copy the setup prompt into the Claude Code session that coordinates your projects (your overseer).
3. Your overseer surveys each project and the towns appear. Keep your lanes on Remote Control and give each project's Owner lane a `/loop` so the kingdom stays live; the **Set up your lanes** guide in the game's menu has a prompt for every role.

Projects run in the cloud from a GitHub repo can keep their own town too: the guide's "Product Owner in the cloud" prompt sets that up.

To update the game later, say **"Update my Kingdom of Agents"**. Claude republishes your page with the new version and keeps your towns, lanes and charter.

## What it runs and what data it uses

- The plugin contains one skill and the game: `skills/kingdom-of-agents/assets/kingdom.html` and the script files it loads (`kingdom-1.js` and on). The skill tells Claude to publish them, unchanged, as an Artifact in your own claude.ai account, with a database that only you (and editors you choose) can write to, and permission to use one tool of your Claude Code connector (`fire_trigger`). The page uses that tool only when you send a decree, message or answer to a cloud project, to start that project's own scheduled task straight away, and claude.ai asks you before its first use.
- Your kingdom's data (project names and descriptions, lane tasks and progress, roadmaps, your questions and decrees) is written to that Artifact database by your own overseer session. It stays in your Claude account. Pip Living receives none of it.
- The page loads two fonts, Press Start 2P and VT323, from Google Fonts (fonts.googleapis.com).
- The page has no analytics or tracking. It makes one other request, and only when you choose to: **Feedback** in the menu sends what you write, the kind you picked (bug, improvement, idea or something else), the game's version and which screen you were on to pipliving.com. Nothing from your kingdom goes with it. If the page can't send it, it opens pipliving.com/kingdom/feedback with your message filled in for you to send there.
- It links to pipliving.com, and to a Stripe checkout page if you choose to buy the Royal Charter. A charter code is checked inside the page, without contacting a server.
- The page stores a few preferences (sound on or off, whether you have seen the welcome, your kingdom's link) in your browser's local storage.

## Help

Feedback: Feedback in the game's menu, or https://www.pipliving.com/kingdom/feedback

Lost charter code or a question: hello@pipliving.com
