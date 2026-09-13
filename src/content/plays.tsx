import type { ReactNode } from 'react'

function Play({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <b className="block text-[17px]">{title}</b>
      <p className="mt-2 leading-relaxed">{children}</p>
    </div>
  )
}

export default function Plays() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold">Underdog plays</h3>
      <p className="my-2 leading-relaxed">
        Floor tactics only. Everything here is something you do inside McCormick Place, between 9 am and 6 pm,
        with no booth and no budget.
      </p>

      <Play title="The backpack booth">
        One HSK63A, one CAT40, a runout video on the phone, a QR card. Nothing on a table, ever. The holder comes
        out only when someone asks or invites you into their booth. A holder in the hand starts more
        conversations than a 10x10 stand, and it is the one thing a walker can carry that an exhibitor cannot
        ignore.
      </Play>

      <Play title="Read the spindles, not the signage">
        Every live-cutting booth in South has our product already loaded: whatever holder brand that OEM chose
        for its own demo. Walk the machines and photograph what is in the spindle and in the ATC carousel. By
        Tuesday night you will know which brands own which OEM showrooms, which interfaces dominate (CAT40
        BIG-Plus vs HSK-A63 vs Capto), and exactly which booth to walk back into with "you are running Haimer on
        that VARIAXIS; here is what we would do differently."
      </Play>

      <Play title="Ask for the demo tool list">
        The single highest-conversion ask of the week, and it costs an OEM nothing: "send us the tool list for
        one demo machine and we ship a free starter set for your showroom." It converts a cold booth chat into a
        shipment with a name on it. Use it at Okuma, Mazak, Makino, Hurco/Takumi, Hermle, Datron, Kern, INDEX,
        SMEC, Hwacheon.
      </Play>

      <Play title="Work the hour gap">
        West opens at 9:00 and closes at 17:00; South and North run 10:00 to 18:00. That gives you a quiet hour
        in the Tooling hall before the crowds, and a second quiet hour in South after West empties. The first
        hour and the last thirty minutes of any hall are when booth staff have nobody to sell to and will
        actually talk. Never spend peak midday hours on a cold introduction.
      </Play>

      <Play title="Hunt the dealers inside the OEM booths">
        Ellison, Productivity, Morris, Hartwig and Gosiger have no booths of their own; their reps wear their own
        badges while standing at Okuma, Mazak, Makino and DN Solutions. These are the people who actually decide
        which tooling line goes out with a new machine. Same for Techniks, Lyndex-Nikken, Maritool and Command
        staff, who are walking the floor as attendees this year. Read every badge in the aisle.
      </Play>

      <Play title="Badge photography instead of lead scanning">
        Non-exhibitors cannot rent scanners, but every badge prints name, title and company. Photograph it, then
        type three words underneath: interface, spindle count, next step. The photo roll is the CRM until Sunday
        night. Do this within ten seconds of walking away, or the detail is gone by the third booth.
      </Play>

      <Play title="Be a regular at the Machinists' Hub">
        Practical Machinist runs live talks, meetups and daily happy hours at 432638, inside our hall. Show up
        every afternoon, help the hosts, become a face rather than a pitch. Ask for a five-minute guest slot by
        Wednesday: "Chinese shrink-fit maker, just opened a US branch, here to find out what American shops
        actually want" is a segment they want. Same play at the Creators Lounge, where podcasters pull one
        interview a day out of the crowd.
      </Play>

      <Play title="Stand where the crowd is already standing">
        Free gathering points beat cold aisles: the Shops Zone at 432634 and the Manufacturing Showcase at 432636
        pull job-shop owners and aerospace buyers all day; Community Park at 432200 is built for loitering; the
        Emerging Technology Center at 236700 and the Industrial AI Arena hold people for twenty minutes at a
        time. The best one all week is the ZOLLER Toolroom of the Year award, Thursday 3:30 pm at 432018: every
        toolroom manager on the floor, in one place, for half an hour. Work the edge of the crowd, not the
        center.
      </Play>

      <Play title="Buy the cheap rooms">
        German Night Tuesday ($85, about 350 people including Haimer, Zoller and German-owned US shops), NTMA
        luncheon Wednesday ($65, a room of job-shop owners), ELEVATE reception Wednesday ($45), Noche Latina
        Tuesday ($40), the Ellison/DN booth reception Tuesday 4–7 pm and the Haas After-Hours 5–6 pm, both free.
        Under $250 total for five rooms of owners and distributors who are standing up and holding a drink. Skip
        the $345 Job Shops Workshop and the $595 Investor Summit.
      </Play>

      <Play title="Chinese peers are allies this week">
        Bright-Tools, Ounuowei, Jingdiao, ZCC USA, Huayan and the CMTBA booth at 432580 are all solving the same
        duty, logistics and distributor problems we are, and none of them competes with us on every SKU. Trade
        notes on the floor. A shared Midwest warehouse, a shared rep firm, or simply knowing which US
        distributors have already said no to a Chinese line is worth a day of cold walking.
      </Play>

      <Play title="Interview the ones who made it">
        YG-1 at 431400 became a default US second source on a Vernon Hills warehouse, a 98% fill rate and a "Best
        Value" position. ZCC USA at 431938 went distributor-only and never leads with origin. Evermore at 431756
        sells behind other people's brands. Ask each one how long it took and what they would skip. Twenty
        minutes with any of them is worth more than a market report, and they will talk because you are not
        competing for their booth traffic.
      </Play>

      <Play title="Press without a press badge">
        Media credentials require an editorial record, so do not try. Instead: Cutting Tool Engineering works out
        of 432313 and publishes dozens of Tooling-hall briefs; Modern Machine Shop editors sit at the Shops Zone;
        Media@IMTS.com takes a one-paragraph pitch. The story that lands is not "we make holders," it is "a
        Chinese manufacturer opened a US branch and came to IMTS without a booth to find out what American shops
        want." One trade mention pays for the week.
      </Play>

      <Play title="Post from the floor every day">
        One LinkedIn post per day tagged #IMTS2026, written as a learner rather than a seller: what you saw, one
        photo from a booth that gave permission, one honest question. Tag the booth. Exhibitors reshare posts
        that make them look good, and their followers are exactly our buyers. This is the only free distribution
        a non-exhibitor has.
      </Play>

      <Play title="Friday is the real show">
        Traffic collapses, staff are relaxed and bored, and the thirty-minute conversation you could not get on
        Tuesday happens without effort. Schedule every deep conversation and every second visit for Friday. Then
        ask Tier C booths what happens to their demo presetter and shrink machine at Saturday teardown;
        competitors sell or give away demo units rather than crate them, and a discounted competitor machine is
        legitimate benchmarking.
      </Play>

      <Play title="Never">
        Flyers or samples handed out in aisles, food courts or lobbies. Stickers or labels anywhere. Any table,
        banner or pop-up outside a booth, even "just for a photo." Pitching booth staff while a customer is
        waiting in front of them. Filming inside a booth that says no photos. Each one is an ejection trigger
        under the exhibitor rules, and the complaint follows the brand long after the badge is pulled.
      </Play>
    </div>
  )
}
