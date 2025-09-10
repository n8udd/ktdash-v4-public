// Index 0 corresponds to Starting Enemy Operatives = 5
export const KillOpChart = [
  [1, 2, 3, 4, 5],   // 5 starting ops
  [1, 2, 4, 5, 6],   // 6 starting ops
  [1, 3, 4, 6, 7],   // 7 starting ops
  [2, 3, 5, 6, 8],   // 8 starting ops
  [2, 4, 5, 7, 9],   // 9 starting ops
  [2, 4, 6, 8, 10],  //10 starting ops
  [2, 4, 7, 9, 11],  //11 starting ops
  [2, 5, 7, 10, 12], //12 starting ops
  [3, 5, 8, 10, 13], //13 starting ops
  [3, 6, 8, 11, 14]  //14 starting ops
];

export const CritOps = [
  {
    title: 'Secure',
    description: `##### Mission Action  

**SECURE — 1AP**  
One objective marker the active operative controls is secured by your kill team until the enemy kill team secures that objective marker.

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

##### Victory Points  

At the end of each turning point after the first:  
- If any objective markers are secured by your kill team, you score **1VP**.  
- If more objective markers are secured by your kill team than your opponent’s kill team, you score **1VP**.`
  },
  {
    title: 'Loot',
    description: `##### Mission Action  

**LOOT — 1AP**  
One objective marker the active operative controls is looted.

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been looted during this turning point.

##### Victory Points  

Whenever a friendly operative performs the Loot action, you score 1VP (to a maximum of 2VP per turning point).`
  },
  {
    title: 'Transmission',
    description: `##### Mission Action  

**INITIATE TRANSMISSION — 1AP**  
One objective marker the active operative controls is transmitting until the start of the next turning point.

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

##### Victory Points  

At the end of each turning point after the first:

- If friendly operatives control any transmitting objective markers, you score 1VP.
- If friendly operatives control more transmitting objective markers than enemy operatives do, you score 1VP.`
  },
  {
    title: 'Orb',
    description: `##### Mission Action  

**MOVE ORB — 1AP**

- If the active operative controls the objective marker that has the Orb token, move that token as follows:
  - If the centre objective marker has it, move it to either player’s objective marker (your choice).
  - If a player’s objective marker has it, move it to the centre objective marker.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if it doesn’t control the objective marker that has the Orb token. 

##### Additional Rules

At the start of the battle, the centre objective marker has the Orb token. 

##### Victory Points  

At the end of each turning point after the first, for each objective marker that friendly operatives control that doesn’t have the Orb token, you score 1VP. `
  },
  {
    title: 'Stake Claim',
    description: `##### Additional Rules

- At the start of the Gambit step of each Strategy phase after the first, starting with the player with initiative, each player must select both one objective marker and one of the following claims for that turning point:
  - Friendly operatives will control that objective marker at the end of this turning point.
  - Enemy operatives won’t contest that objective marker at the end of this turning point.
- Each player cannot select each objective marker more than once per battle (so they must select each objective marker once during the battle).

##### Victory Points  


- If friendly operatives control more objective markers than enemy operatives do, you score 1VP.
- If your selected claim is true, you score 1VP.`
  },
  {
    title: 'Energy Cells',
    description: `##### Additional Rules


- Operatives can perform the Pick Up Marker action upon each objective marker in the following turning points:
  - 2, but you must spend an additional 2AP (that action cannot be free and its AP cannot be reduced).
  - 3, but you must spend an additional 1AP (that action cannot be free and its AP cannot be reduced).
  - 4 (as normal).
- Whenever an operative is carrying an objective marker, that operative cannot be removed and set up again more than 6" away.

##### Victory Points  

- At the end of each turning point, if friendly operatives control more objective markers than enemy operatives do, you score 1VP.
- At the end of the battle, for each objective marker friendly operatives are carrying, you score 1VP.`
  },
  {
    title: 'Download',
    description: `##### Mission Action  

**DOWNLOAD — 1AP**

- One centre or opponent's objective marker the active operative controls is downloaded.
- An operative cannot perform this action during the first or second turning point, while within control range of an enemy operative, or if that objective marker has already been downloaded during the battle. 

##### Victory Points  

- At the end of each turning point after the first, if friendly operatives control more objective markers than enemy operatives do, you score 1VP. Ignore downloaded objective markers when determining this.
- Whenever a friendly operative performs the Download action during the third turning point, you score 1VP.
- Whenever a friendly operative performs the Download action during the fourth turning point, you score 2VP.`
  },
  {
    title: 'Data',
    description: `##### Mission Action  

**COMPILE DATA — 1AP**

- One objective marker the active operative controls gains 1 Data point. Use a dice as a token to keep track of Data points at that objective marker.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already gained a Data point during this turning point. 

**SEND DATA — 1AP**

- Remove all Data points from an objective marker the active operative controls.
- An operative cannot perform this action during the first, second or third turning point, while within control range of an enemy operative, or if that objective marker doesn’t have any Data points to remove. 

##### Victory Points  

- At the end of the second and third turning point, if friendly operatives have performed more Compile Data actions during that turning point than enemy operatives have, you score 1VP.
- Whenever a friendly operative performs the Send Data action, you score a number of VP equal to the number of Data points removed.`
  },
  {
    title: 'Reboot',
    description: `##### Mission Action  

**Reboot — 1AP**

- One inert objective marker the active operative controls is no longer inert.
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative. 

##### Additional Rules

- When setting up the battle, after setting up objective markers, number each objective marker 1–3.
- At the start of the Gambit step of each Strategy phase, each player secretly selects one objective marker by putting a number of dice in their hand that matches that marker’s number, then reveal simultaneously:
  - If both players selected the same one, that objective marker is inert during this turning point.
  - If not, the objective marker that neither player selected is inert during this turning point.

##### Victory Points  

At the end of each turning point after the first, for each objective marker friendly operatives control, you score 1VP. Ignore inert objective markers when determining this.`
  }
]

export const TacOps = [
{
archetype: "Seek And Destroy",
title: "Champion",
description: `**Reveal:** When you select your first Champion.  

**Additional Rules:**  

As a STRATEGIC GAMBIT in each turning point after the first, you can select one friendly operative to be your champion for the turning point.  

**Victory Points:**  

In each turning point after the first, whenever your champion incapacitates an enemy operative you score 1VP, or 2VP if that enemy operative had a wound stat of 12 or more (in either case to a maximum of 2VP per turning point).`
},
{
archetype: "Seek And Destroy",
title: "Overrun",
description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**  

Once per turning point after the first, if an enemy operative is incapacitated by a friendly operative, and that friendly operative is wholly within your opponent's territory when it does so, you score 1VP.  

At the end of each turning point after the first, if the total APL stat of friendly operatives that both fulfilled the above condition that turning point (regardless of you scoring the VP) and are still wholly within your opponent's territory is 3 or more, you score 1 VP.`
},
{
archetype: "Seek And Destroy",
title: "Storm Objectives",
description: `**Reveal:** When you first score VP from this op.  

**Additional Rules:**  

At the end of each friendly operative's activation, if it controls an objective marker that enemy operatives controlled at the start of that activation or that is wholly within your opponent's territory,
and that objective marker is not contested by enemy operatives, that objective marker is stormed by friendly operatives this turning point.  

**Victory Points:**  

Once per turning point after the first, if an objective marker is stormed by Friendly operatives this turning point, you score 1VP.  

At the end of each turning point after the first, if friendly operatives control an objective marker that was stormed by friendly operatives this turning point, you score 1VP.`
},
{
archetype: "Security",
title: "Contain",
description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**

At the end of each turning point after the first:
- If there are no enemy operatives wholly within your territory, you score 1 VP.  
- If there are no enemy operatives wholly within 6" of your drop zone, you score 1 VP.`
},
{
archetype: "Security",
title: "Secure Centre",
description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**  

At the end of each turning point after the first:
- If the total APL of friendly operatives within 3" of the centre of the killzone is greater than that of enemy operatives, you score 1VP.  
- If the total APL of friendly operatives on the centreline but more than 3" from the centre of the killzone is greater than that of enemy operatives, you score 1VP.`
},
{
archetype: "Security",
title: "Take Ground",
description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**  

At the end of each turning point after the first:

- In Killzone Volkus: if friendly operatives control any stronghold terrain features within your opponent's territory, you score 2VP; for each ruin (Large or small) terrain feature within your opponent's territory that friendly operatives control, you score 1 VP.
- In Killzone Gallowdark, for each access point you control that is on the centreline or within your opponent's territory that friendly operatives control, you score 1 VP.
- In any other kill zone, for each terrain feature with Heavy terrain within your opponent's territory that Friendly operatives control, you score 1 VP.
You can score a maximum of 2VP form this op per turning point.  

An operative contests a stronghold terrain feature it is wholly within.
An operative contests all other terrain features within their control range, or while underneath a terrain feature's Vantage terrain.
Friendly operative control each such terrain feature if the total APL stat of those contesting it is greater than that of enemy operatives.`
},
{
archetype: "Infiltration",
title: "Implant",
description: `**Reveal:**  When you first score VP from this op.  

**Additional Rules:**  

Whenever a friendly operative is fighting, when you would resolve an attack dice, you can implant the enemy operative instead of striking or blocking (then discard that dice).  

Whenever a friendly operative is shooting an enemy operative within 6" of it, when you would resolve an attack dice, you can instead implant the enemy operative instead of inflicting damage with that dice.  

Each operative can only be implanted once, and cannot be implanted during the first turning point.  

**Victory Points:**  

Once per turning point after the first, if you implant an enemy operative, you score 1VP.  

At the end of each turning point after the first, if any implanted enemy operatives are in the killzone, you score 1 VP.`
},
{
archetype: "Infiltration",
title: "Surveillance",
description: `**Reveal:**  The first time a friendly operative performs the Surveillance Action.  

**Mission Action: Surveillance (1 AP)**  

The active operative has gathered surveillance.
- An operative cannot perform this action while it has an Engage order. It must be wholly within your opponent's territory to perform this action, and there must be an enemy operative that is a valid target for it.
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

**Victory Points:**  

Once per turning point after the first, if a friendly operative performs the Surveillance action, you score 1 VP.  

At the end of each turning point after the first, if a friendly operative has performed the Surveillance action during that turning point is in the killzone and has a conceal order, you score 1 VP`
},
{
archetype: "Infiltration",
title: "Wiretap",
description: `**Reveal:**  The first time a friendly operative performs the Wiretap Action.  

**Mission Action: Wiretap (1 AP)**  

Place one of your Wiretap mission markers within the active operative's control range.
In the ready step of the next Strategy phase, remove that marker.  

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, during an activation in which it was set up, or if a friendly operative has already performed this
action during the turning point.  

**Victory Points:**  

Once per tuning point after the first, whenever an enemy operative starts or ends an action within 2" of your Wiretap mission marker, you score 1 VP.  

At the end of each turning point after the first, if any enemy operatives with an Engage order are within 2" of your Wiretap mission marker, you score 1 VP.`
},
{
archetype: "Recon",
title: "Confirm Kill",
description: `**Reveal:** The first time an enemy operative is incapacitated.  

**Additional Rules:**  

Whenever an enemy operative is incapacitated, before it is removed from the killzone, place one of your Confirm Kill mission markers within its control range.  

**Victory Points:**  

At the end of each turning point after the first, if a friendly operative controls one of your Confirm Kill mission markers, that marker is not contested by enemy operatives and no enemy operatives are that are
within that friendly operative's control range, you can remove that marker to score 1VP, or 2VP if it was placed for an enemy operative with a wounds stat of 12 or more.  

You can score a maximum of 2 VP from this op per turning point.`
},
{
archetype: "Recon",
title: "Recover Items",
description: `**Reveal:** At the start of the Set Up operatives step, before equipment is set up.  

**Additional Rules:**  

When revealed, your opponent places one of your Item mission markers on the centreline and one within 2" of your territory.
You then place one more than 6" from your territory. In all cases, your Item mission markers must be 2" from other markers (including other item mission markers).
Your operatives can perform the Pick Up Marker action on your Item mission markers after the first turning point.  

**Victory Points:**  

At the end of the fourth turning point, for each of your Item mission markers that both the Pick Up Marker action has been performed
upon and friendly operatives control, you score 2VP. Note that it is not a requirement to be carrying those markers, but each of them
must have been carried by friendly operatives at some point during the battle.`
},
{
archetype: "Recon",
title: "Plant Beacon",
description: `**Reveal:** The first time a friendly operative performs the Plant Beacon action.  

**Mission Action: Plant Beacon (1 AP)**  

Place one of your Beacon mission markers:

- Within the active operative's control range
- More than 4" from your drop zone
- More than 6" from your other Beacon mission markers
- With no part of it underneath Vantage terrain

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative, or during an activation in which it was set up.

**Victory Points:**  

Once per turning point after the first, whenever one of your Beacon mission markers is placed wholly within your territory, you score 1VP.  

Once per turning point after the first, whenever one of your Beacon mission markers is placed wholly within your opponent's territory, you score 1VP.`
}
]
