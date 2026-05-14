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
]

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
- If more objective markers are secured by your kill team than your opponent's kill team, you score **1VP**.`
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
  - If the centre objective marker has it, move it to either player's objective marker (your choice).
  - If a player's objective marker has it, move it to the centre objective marker.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if it doesn't control the objective marker that has the Orb token. 

##### Additional Rules

At the start of the battle, the centre objective marker has the Orb token. 

##### Victory Points  

At the end of each turning point after the first, for each objective marker that friendly operatives control that doesn't have the Orb token, you score 1VP. `
  },
  {
    title: 'Stake Claim',
    description: `##### Additional Rules

- At the start of each Turning Point after the first, starting with the player with initiative, each player must select both one objective marker and one of the following claims for that turning point:
  - Friendly operatives will control that objective marker at the end of this turning point.
  - Enemy operatives won't contest that objective marker at the end of this turning point.
- Each player cannot select each objective marker more than once per battle (so they must select each objective marker once during the battle).

##### Victory Points  


- At the end of each turning point after the first, if friendly operatives control more objective markers than enemy operatives do, you score 1VP.
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

- At the end of each turning point after the first, if friendly operatives control more objective markers than enemy operatives do, you score 1VP.
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
- An operative cannot perform this action during the first, second or third turning point, while within control range of an enemy operative, or if that objective marker doesn't have any Data points to remove. 

##### Victory Points  

- At the end of the second and third turning point, if friendly operatives have performed more Compile Data actions during that turning point than enemy operatives have, you score 1VP.
- Whenever a friendly operative performs the Send Data action, you score a number of VP equal to the number of Data points removed.`
  },
  {
    title: 'Reboot',
    description: `##### Mission Action  

**Reboot — 2AP**

- One inert objective marker the active operative controls is no longer inert.
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative. 

##### Additional Rules

- When setting up the battle, after setting up objective markers, number each objective marker 1–3.
- At the start of the Gambit step of each Strategy phase, each player secretly selects one objective marker by putting a number of dice in their hand that matches that marker's number, then reveal simultaneously:
  - If both players selected the same one, that objective marker is inert during this turning point.
  - If not, the objective marker that neither player selected is inert during this turning point.

##### Victory Points  

At the end of each turning point after the first, for each objective marker friendly operatives control, you score 1VP. Ignore inert objective markers when determining this.`
  }
]

export const CritOps2024 = [
  {
    title: 'Secure (2024)',
    description: `##### Mission Action  

**Secure — 1AP**

- One objective marker the active operative controls is secured by your kill team until the enemy kill team secures that objective marker
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative. 

##### Victory Points  

At the end of each turning point after the first:
- If any objective markers are secured by your kill team, you score 1 VP
- If more objectifve markers are secured by your kill team than your opponent's kill team, you score 1 VP`
  },
  {
    title: 'Loot (2024)',
    description: `##### Mission Action  

**Loot — 1AP**

- One objective marker the active operative controls is looted
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been looted during this turning point. 

##### Victory Points  

Whenever a friendly operative performs the Loot action, you score 1 VP (to a maximum of 2VP per turning point)`
  },
  {
    title: 'Transmission (2024)',
    description: `##### Mission Action  

**Initiate Transmission — 1AP**

- One objective marker the active operative controls is transmitting until the start of the next turning point
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative 

##### Victory Points  

At the end of each turning point after the first:
- If friendly operatives control any transmitting objective markers, you score 1 VP
- If friendly operatives control more transmitting objective markers than enemy operatives do, you score 1 VP`
  },
  {
    title: 'Upload (2024)',
    description: `##### Mission Action  

**Upload — 1AP**

- Remove all of your opponent's Upload points (if any) from an objective marker the active operative controls
- Then that objective marker gains 1 of your Upload points, unless it has already gained 1 of your Upload points during this turning point, or you have already scored from that objective marker. Use a die as a token to keep track of your Upload points at that objective marker.
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative

##### Victory Points  

At the end of each turning point after the first, you can score from any objective markers that have 1 or more of your Upload points.
For each that you do, remove all of your Upload points from it - You score the same number of VP.
You can only score from each objective marker once, and note that friendly operatives don't have to control that objective marker to score from it.`
  },
  {
    title: 'Intel (2024)',
    description: `##### Mission Action  

**Compile Intel — 1AP**

- One objective marker the active operative controls gains 1 Intel point. Use a die as a token to keep track of Intel points at that objective marker.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already gained an Intel point during this turning point

##### Additional Rules

In each turning point after the first, the Pick Up Marker action can be performed upon each objective marker that has at least 1 Intel point. If it's performed, that marker cannot gain any more Intel points.

##### Victory Points  

At the end of the fourth turning point, for each objective marker friendly operatives control, you score a number of VP equal to its Intel points (i.e., 0-3).`
  },
  {
    title: 'Search (2024)',
    description: `##### Mission Action  

**Search — 1AP**

- One objective marker the active operative controls is Searched. If it's the last objective marker to be searched, that marker becomes the extraction objective marker
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been searched

##### Additional Rules

The Pick Up Marker action can be performed upon the extraction objective marker. While an operative is carrying that marker, worsen the Hit stat of its weapons by 1, it cannot be removed and set up more than 6" away, and it cannot perform Charge or Dash actions.

##### Victory Points  

Whenever a friendly operative performs the Search action, you score 1 VP if it's the first or third objective marker to be searched, or 2 VP if it's the second.
At the end of each turning point after the first, if friendly operatives control the extraction objective marker, you score 1 VP, or 2VP if it's the fourth turning point.`
  },
  {
    title: 'Sabotage (2024)',
    description: `##### Mission Action  

**Sabotage — 1AP**

- If the active operative controls the objective marker wholly within your opponent's territory, that marker is sabotaged
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been sabotaged during this turning point

##### Victory Points  

Whenever a friendly operative performs the Sabotage action, you score 1 VP.  
At the end of each turning point after the first, you score 1 VP for each of the following the friendly operatives control:
- The objective marker wholly within your territory (unless if's been sabotaged this turning point)
- The objective marker on the center line

You can score a maximum of 2 VP from the op per turning point.`
  },
  {
    title: 'Power Surge (2024)',
    description: `##### Mission Action  

**Reroute Power — 1AP**

- One surged objective marker the active operative controls is rerouted
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been rerouted

##### Additional Rules

As a **Strategic Gambit** in each turning point after the first, one player selects one objective marker to be surged until the start of the next turning point (they cannot select one previously surged).
The player who does not have initiative selects first, then players alternate each turning point thereafter.

##### Victory Points  

Whenever a friendly operative performs the Reroute action, you score 1 VP.
At the end of each turning point after the first: if friendly operatives control the surged objective marker, you score 1 VP;
if friendly operatives control more objective markers than enemy operatives do, you score 1 VP.

You can score a maximum of 2 VP from the op per turning point.`
  },
  {
    title: 'Coordinates (2024)',
    description: `##### Mission Action  

**Input Coordinates — 1AP**

- One surged objective marker the active operative controls gains 1 of your Objective points. Use a die as a token to keep track of Objective points at that objective marker
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already gained 1 of your Objective points during this turning point

##### Victory Points  

At the end of the fourth turning point:
- For each objective marker that has at least 1 of your Objective points, you score 1 VP, or 2VP if that objective marker is wholly within your opponent's territory
- For each objective marker that has more of your Objective points that your opponent's, you score 1 VP`
  }
]

export const TacOps = [
  {
    archetype: 'Seek And Destroy',
    title: 'Sweep & Clear',
    description: `**Reveal:** The first time an enemy operative is incapacitated while contesting an objective marker, or the first time a friendly operative performs the Clear action (whichever comes first).

**Additional Rules:**  

When an enemy operative that contests an objective marker is incapacitated, that objective marker gains one of your Swept tokens (if it doesn't already have one) until the Ready step of the next Strategy phase.

**Mission Action: Clear (1 AP)**

- An objective marker the active operative controls is cleared for the turning point.
- An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

**Victory Points:**  

- At the end of each turning point after the first, if at least one objective marker (excluding your objective marker) is cleared and enemy operatives do not contest that marker, you score 1VP. If that marker also has one of your Swept tokens, you score 2VP instead.
- If friendly operatives control an objective marker that has one of your Swept tokens, you score 1 VP.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Seek And Destroy',
    title: 'Dominate',
    description: `**Reveal:** The first time an enemy operative is incapacitated by a friendly operative.

**Additional Rules:**

Each time a friendly operative incapacitates an enemy operative, that friendly operative gains one of your 
or two of your Dominate tokens if that enemy operative had a Wounds stat of 12 or more.

**Victory Points:**  

At the end of the third and fourth turning point, you can remove Dominate tokens from friendly operatives that aren't incapacitated. For each you remove, you score 1VP.

You cannot score more than 3VP from this op per turning point.`
  },
  {
    archetype: 'Seek And Destroy',
    title: 'Rout',
    description: `**Reveal:** The first time you score VP from this op.

**Victory Points:**  


Whenever a friendly operative incapacitates an enemy operative, if that friendly operative is within 6" of your opponent's drop zone, you score 1VP; if this is true and that enemy operative had a Wounds stat of 12 or more, you score 2VP instead.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Security',
    title: 'Plant Banner',
    description: `**Reveal:** When you perform the Plant Banner action.

**Mission Action: Plant Banner (1 AP)**

- Place your Banner mission marker within the active operative's control range, wholly within your opponent's territory and more than 5" from a neutral killzone edge. Operatives can perform the Pick Up Marker action on your Banner mission marker.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if a friendly operative has already performed this action during the battle.

**Victory Points:**

At the end of each turning point after the first, if your Banner mission marker is wholly within your opponent's territory and friendly operatives control it, you score 1VP; if that's true and no enemy operatives contest it, you score 2VP instead. Note your Banner mission marker must be in the killzone (not being carried) to score.`
  },
  {
    archetype: 'Security',
    title: 'Martyrs',
    description: `**Reveal:** The first time a friendly operative is incapacitated while contesting an objective marker.

**Additional Rules:**

Whenever a friendly operative is incapacitated while contesting an objective marker, that marker gains one of your Martyr tokens.  
Note that this is only the first time each operative is incapacitated, so if an operative is incapacitated, set back up (e.g. HIEROTEK CIRCLE Reanimation Protocols) and then subsequently incapacitated again, a second Martyr token cannot be gained as a result.

**Victory Points:**  

At the end of each turning point after the first, if friendly operatives contest an objective marker that has one or more of your Martyr tokens, you can remove any of those tokens. For each token you remove, you score 1VP; if friendly operatives also control that marker, you score 2VP instead.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Security',
    title: 'Envoy',
    description: `**Reveal:** The first time you select an envoy.

**Additional Rules:**

As a STRATEGIC GAMBIT in each turning point after the first, select one friendly operative to be your envoy until the Ready step of the next Strategy phase. You cannot select an operative you selected during a previous turning point or an operative that's ignored for the kill op.

**Victory Points:**  

At the end of each turning point after the first, if your envoy is wholly within enemy territory and not within control range of enemy operatives, you score 1VP; if this is true and your envoy has not lost any wounds during that turning point, you score 2VP instead.`
  },
  {
    archetype: 'Infiltration',
    title: 'Track Enemy',
    description: `**Reveal:**  The first time you score VP from this op.

**Additional Rules:**  

An enemy operative is being tracked if it's a valid target for a friendly operative within 6" of it. That friendly operative must have a Conceal order, cannot be a valid target for the enemy operative it's attempting to track, and cannot be within control range of enemy operatives.

**Victory Points:**  

At the end of each turning point after the first:

- If one enemy operative is being tracked, you score 1VP, or 2VP instead if it's the fourth turning point.
- If two or more enemy operatives are being tracked, you score 2VP.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Infiltration',
    title: 'Plant Devices',
    description: `**Reveal:**  The first time a friendly operative performs the Plant Device action.  

**Mission Action: Plant Device (1 AP)**

- One objective marker the active operative controls gains one of your Device tokens.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker already has one of your Device tokens.

**Victory Points:**  

At the end of each turning point after the first:

- If your opponent's objective marker has one of your Device tokens, you score 1VP.
- For each other objective marker enemy operatives contest that has one of your Device tokens, you score 1VP.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Infiltration',
    title: 'Steal Intelligence',
    description: `**Reveal:**  The first time an enemy operative is incapacitated.

**Additional Rules:**

Whenever an enemy operative is incapacitated, before it's removed from the killzone, place one of your Intelligence mission markers within its control range.

Friendly operatives can perform the Pick Up Marker action on your Intelligence mission markers, and for the purposes of that action's conditions, ignore the first Intelligence mission marker the active operative is carrying. In other words, each friendly operative can carry up to two Intelligence mission markers, or one and one other marker.

**Victory Points:**  

At the end of each turning point after the first, if any friendly operatives are carrying any of your Intelligence mission markers, you score 1VP.

At the end of the battle, for each of your Intelligence mission markers friendly operatives are carrying, you score 1VP.`
  },
  {
    archetype: 'Recon',
    title: 'Flank',
    description: `**Reveal:** As a STRATEGIC GAMBIT.  

**Additional Rules:**  

Divide the killzone into two flanks (left and right) by drawing an imaginary line that's just like the centreline, except it runs from the centre of each player's killzone edge.
An operative contests a flank while both wholly within it and wholly within their opponent's territory.
Friendly operatives control a flank if the total APL stat of those contesting it is greater than that of enemy operatives.

**Victory Points:**  


- After you reveal this op, at the end of each turning point after the first, for each flank friendly operatives control, you score 1VP.
- In the fourth turning point, ff friendly operatives also controlled that flank at the end of the third turning point, you score 2VP instead.

You cannot score more than 2VP from this op per turning point.`
  },
  {
    archetype: 'Recon',
    title: 'Retrieval',
    description: `**Reveal:** The first time you score VP from this op.

**Mission Action: Retrieve (1 AP)**

- If the active operative controls an objective marker that hasn't been searched by friendly operatives, that operative is now carrying one of your Retrieval mission markers and that objective marker has been searched by friendly operatives.
Friendly operatives can perform the Pick Up Marker action on your Retrieval mission markers.
- An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if it's already carrying a marker. 

**Victory Points:**  


- The first time each objective marker is searched by friendly operatives, you score 1VP.
- At the end of the battle, for each of your Retrieval mission markers friendly operatives are carrying, you score 1VP.`
  },
  {
    archetype: 'Recon',
    title: 'Scout Enemy Movement',
    description: `**Reveal:** The first time a friendly operative performs the Scout action.  

**Mission Action: Scout (1 AP)**  

- Select one ready enemy operative visible to and more than 6" from the active operative. That enemy operative is now monitored until the Ready step of the next Strategy phase.
- An operative cannot perform this action while it has an Engage order, during the first turning point, or while within control range of an enemy operative. 

**Victory Points:**  

At the end of each turning point after the first, for each monitored enemy operative that's visible to friendly operatives, you score 1VP. Note that it doesn't have to be a friendly operative that performed the Scout action.

You cannot score more than 2VP from this op per turning point.`
  }
]

export const TacOps2024 = [
  {
    archetype: 'Seek And Destroy',
    title: 'Champion (2024)',
    description: `**Reveal:** When you select your first Champion.  

**Additional Rules:**  

As a STRATEGIC GAMBIT in each turning point after the first, you can select one friendly operative to be your champion for the turning point.  

**Victory Points:**  

In each turning point after the first, whenever your champion incapacitates an enemy operative you score 1VP, or 2VP if that enemy operative had a wound stat of 12 or more (in either case to a maximum of 2VP per turning point).`
  },
  {
    archetype: 'Seek And Destroy',
    title: 'Overrun (2024)',
    description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**  

Once per turning point after the first, if an enemy operative is incapacitated by a friendly operative, and that friendly operative is wholly within your opponent's territory when it does so, you score 1VP.  

At the end of each turning point after the first, if the total APL stat of friendly operatives that both fulfilled the above condition that turning point (regardless of you scoring the VP) and are still wholly within your opponent's territory is 3 or more, you score 1 VP.`
  },
  {
    archetype: 'Seek And Destroy',
    title: 'Storm Objectives (2024)',
    description: `**Reveal:** When you first score VP from this op.  

**Additional Rules:**  

At the end of each friendly operative's activation, if it controls an objective marker that enemy operatives controlled at the start of that activation or that is wholly within your opponent's territory,
and that objective marker is not contested by enemy operatives, that objective marker is stormed by friendly operatives this turning point.  

**Victory Points:**  

Once per turning point after the first, if an objective marker is stormed by Friendly operatives this turning point, you score 1VP.  

At the end of each turning point after the first, if friendly operatives control an objective marker that was stormed by friendly operatives this turning point, you score 1VP.`
  },
  {
    archetype: 'Security',
    title: 'Contain (2024)',
    description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**

At the end of each turning point after the first:
- If there are no enemy operatives wholly within your territory, you score 1 VP.  
- If there are no enemy operatives wholly within 6" of your drop zone, you score 1 VP.`
  },
  {
    archetype: 'Security',
    title: 'Secure Centre (2024)',
    description: `**Reveal:** When you first score VP from this op.  

**Victory Points:**  

At the end of each turning point after the first:
- If the total APL of friendly operatives within 3" of the centre of the killzone is greater than that of enemy operatives, you score 1VP.  
- If the total APL of friendly operatives on the centreline but more than 3" from the centre of the killzone is greater than that of enemy operatives, you score 1VP.`
  },
  {
    archetype: 'Security',
    title: 'Take Ground (2024)',
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
    archetype: 'Infiltration',
    title: 'Implant (2024)',
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
    archetype: 'Infiltration',
    title: 'Surveillance (2024)',
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
    archetype: 'Infiltration',
    title: 'Wiretap (2024)',
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
    archetype: 'Recon',
    title: 'Confirm Kill (2024)',
    description: `**Reveal:** The first time an enemy operative is incapacitated.  

**Additional Rules:**  

Whenever an enemy operative is incapacitated, before it is removed from the killzone, place one of your Confirm Kill mission markers within its control range.  

**Victory Points:**  

At the end of each turning point after the first, if a friendly operative controls one of your Confirm Kill mission markers, that marker is not contested by enemy operatives and no enemy operatives are that are
within that friendly operative's control range, you can remove that marker to score 1VP, or 2VP if it was placed for an enemy operative with a wounds stat of 12 or more.  

You can score a maximum of 2 VP from this op per turning point.`
  },
  {
    archetype: 'Recon',
    title: 'Recover Items (2024)',
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
    archetype: 'Recon',
    title: 'Plant Beacon (2024)',
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
