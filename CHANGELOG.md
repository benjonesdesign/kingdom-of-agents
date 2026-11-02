# Changelog

## 2.10.0

**Copy the setup prompt into your overseer again** so it reports what the Royal Council needs.

- The Royal Council, in the throne room, the menu and each town's status panel:
  - Proof marks: every finished step shows whether it was tested, checked by you or unchecked, and you can mark it checked.
  - Laws of the Realm: how free lanes are to ship, and what they must always ask you about first, for the kingdom or per town.
  - Curfew and the Guard: a limit on lanes working at once, and quiet hours when lanes hold non-urgent asks.
  - Kingdom Quests: two to four goals, with the roadmap steps that serve each and the work that serves none.
  - The Chronicle: steps finished, reopened and blocked this week against last, with a share card.
  - The Herald's Report: a plain-English weekly update per project, ready to copy.
  - Crossroads: lanes that clash and projects that wait on each other, with a bandit on the road between clashing towns.
  - The Treasury: spend per project against a weekly budget, where the overseer can measure it.
  - The Guild Hall: teammates as lords in a shared kingdom, lane setups to share, and a setup prompt for each teammate.
- Decrees in a minute: run the overseer on /loop with no time. It checks every minute while the kingdom is open, and every 15 minutes otherwise, so decrees, lane messages and your answers arrive in a minute or two. The setup prompt, the welcome steps and the lanes guide all say how; the throne room shows when the overseer is on the quick loop.
- Asks in every town: a town with questions for you shows ASKS in its status panel, so you can hear one project's asks on their own. A project with its own roadmap and asks page gets a PROJECT PAGE link, and answers given in the kingdom are recorded on that page too (and the other way round).
- Cloud projects: a project run in the cloud from its GitHub repo can keep its own town. Its Product Owner adds one part to its prompt (Set up your lanes has it), the overseer on your computer leaves it alone, and each lane shows whether it runs in the cloud or locally. Decrees, lane messages and answers for it wake its Product Owner straight away, through your Claude Code connector (the page asks first).
- Feedback in the menu: choose bug, improvement, idea or something else and write a message. It goes to Pip Living with the game's version and the screen you were on, nothing from your kingdom. Where the page can't send it directly, it opens pipliving.com/kingdom/feedback with your message filled in.
- The Royal Audience: open asks are petitioners queueing up the throne room's carpet, most pressing first. Tap one, or Hold an Audience on the scroll, to hear them one at a time.
- The council table: four councillors sit on the right of the throne room around a long table carved with your kingdom's map and a piece for every town. Tap it to open the Council.
- Mini-games: one for each kind of town, played at a little game board beside its landmark. The Royal Feast is at the new banquet table running down the left of the throne room.
  - Free: The Royal Feast (serve every guest the dish they ask for), Wishing Fountain (aim, then power, then land coins in the rings) and Round-Up (herd the flock into the pen before dusk).
  - With the Royal Charter, in the towns it adds: Ship the Treasure (match three gems), Rune Echo (repeat the runes' song), Treasure Hunter (dig the seam without hitting dynamite) and River Hop (cross on logs, boats, barrels and lily pads to post four letters).
- The Royal Feast gets busier as it goes: guests arrive more often and walk faster, with a warning every 30 seconds.
- Share: a share button on the world map, in the throne room and in every town, and after each mini-game, with numbers only.
- Mini-games in the menu: every game, where to find it and your best score.
- Seven new achievements, and new gossip from the barmaid to go with them.
- A roomier throne room: wider and longer, with the pillars further apart, the banners' labels clear of the throne, six guards lining the carpet, and the scroll on a small table beside the throne.
- The Curiosity Tent's back wall gives way so the merchant and the chest always stand clear of the merchant's message box.
- The Curio Merchant keeps it short: one line, then a nudge to tap a cage and see what's inside.
- Fix: the Curiosity Pack's decorations (lighthouse, bandstand, maypole, waterwheel, star glass, gold scales) now always appear once the chest is opened. Before, some never found room in their town.

## 2.9.2

- The game now comes as a page plus three script files instead of one large file, so the plugin directory can check every file. Nothing in the game changes. To update, ask Claude to update your Kingdom of Agents.

## 2.9.1

- On wide screens the throne room's scroll (and a town's status panel) opens from a scroll button in the right-hand controls.
- Answering a lane's question now sends a herald out of the throne room, with a messenger riding to that town on the map, just like a decree.

## 2.9.0

- A new menu: a short summary of each section, then a page for each (kingdom status, how it works, achievements, settings, about).
- Achievements: 24 secrets to find around the kingdom, shown as mysteries until you find them.
- Tap the barmaid in any tavern for some gossip, which is often a clue.

## 2.8.0

- Rule as a King or a Queen: chosen in the welcome, with a Queen on the throne and every title to match.
- A clearer welcome: the overseer step is four short steps, and a final card explains how to keep lanes running and how to update.
- Roadmaps for every project in town views and the throne room.
- Lanes report progress as steps done out of the total, and buildings grow one stage per step. **Copy the setup prompt into your overseer again** so it reports steps and roadmaps.
- Message lanes and send idle lanes back to work from the town view.
