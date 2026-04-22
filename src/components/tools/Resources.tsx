import Link from 'next/link'
import { Button, SectionTitle } from '../ui'

export default function Resources() {
  return (
    <div className="space-y-4">
      <div className="section">
        <SectionTitle>Resources</SectionTitle>
        <ul>
          <li>
            Terrain STLs:
            <ul>
              <li><Link href="https://www.thingiverse.com/jodawznev/designs" target="_blank" className="underline">Thingiverse</Link></li>
              <li><Link href="https://cults3d.com/en/users/jodawznev/3d-models" target="_blank" className="underline">Cults3d</Link></li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="section">
        <SectionTitle>Community</SectionTitle>
        <p className="text-muted">
          This is a Community-driven project, and we welcome contributions, feedback, and suggestions.
          If you have ideas for new features, improvements, or just want to chat about the game, please join our community channels.
        </p>
        <ul>
          <li><Link href="https://discord.gg/zyuVDgYNeY" target="_blank" className="underline">Discord</Link></li>
          <li><Link href="https://github.com/vjosset/ktdash-v4-public" target="_blank" className="underline">GitHub</Link></li>
        </ul>
      </div>
      <div className="section">
        <SectionTitle>Try Ruinstars</SectionTitle>
        <p className="pb-3">
          Ruinstars is the squad skirmish game this app was built on:
          free, miniatures-agnostic, and designed for solo, co-op, and competitive play in 45-90 minutes.
          If you like Kill Team, you'll find Ruinstars familiar in structure and deeper in narrative campaign.
        </p>
        <Button><a href="https://ruinstars.com" target="_blank"><h6>Play Ruinstars free</h6></a></Button>
      </div>
    </div>
  )
}