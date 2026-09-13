import type { ReactNode } from 'react'

function Day({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2">
        <b className="text-[17px]">{title}</b>
        <span className="text-[13px] text-[var(--muted)]">{meta}</span>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Slot({ t, children }: { t: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--line)] py-3 last:border-b-0 sm:grid-cols-[minmax(0,84px)_1fr] sm:gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--muted)]">{t}</div>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

function Goal({ children }: { children: ReactNode }) {
  return <span className="font-semibold">{children}</span>
}

function Ev({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 font-medium text-[var(--accent-ink)]">
      {children}
    </span>
  )
}

export default function Days() {
  return (
    <div>
      <p className="my-2 leading-relaxed">
        With two reps: one lives in West, one in South, swap Wednesday. With one rep: follow the plan as written.
        Every day ends with follow-up emails sent before bed; a lead that waits until Sunday is cold.
      </p>

      <Day title="Sunday 13 · Day zero" meta="set up">
        <Slot t="morning">
          <Goal>Kit.</Goal> One HSK63A and one CAT40 in the backpack, a runout demo video on the phone, QR cards
          that open a "HIPPSC at IMTS, book 15 min" page with the show offer (free 5-holder trial), spec sheet
          PDF, cards with the US address and phone. Two power banks; booth WiFi is 768 kbps, plan on cellular.
        </Slot>
        <Slot t="midday">
          <Goal>Pre-show emails.</Goal> Media@IMTS.com, CTE editors, MMS: one paragraph, offer a 10-minute
          walk-and-talk. DM three podcasters on LinkedIn (MakingChips, Manufacturing Happy Hour, Mavens of
          Manufacturing); they record on site and need guests. Book the Marriott Marquis table for Tuesday 8 pm
          and Thursday 7 pm.
        </Slot>
        <Slot t="evening">
          <Goal>Tickets.</Goal> German Night ($85), Noche Latina ($40), ELEVATE reception ($45), NTMA lunch
          ($65). Under $250 for four rooms of owners and distributors. LinkedIn post #1: "Landed in Chicago. Six
          days, no booth, one question for every American shop we meet."{' '}
          <Ev>Optional: DMG MORI Innovation Days opens today in Hoffman Estates.</Ev>
        </Slot>
      </Day>

      <Day title="Monday 14 · West" meta="9:00–17:00">
        <Slot t="9:00">
          <Goal>Quiet-hour sweep of Tier A resellers and importers in West.</Goal> Tool Holder Shop, Accutek,
          PAC, Delton, Royal, Omega TMM, Global CNC, Platinum, iSwiss, Euro-Tech, JM Performance. Staff are
          fresh, no customers yet. Ten minutes each, two questions, badge photo, move.
        </Slot>
        <Slot t="11:00">
          <Goal>China cluster and CMTBA.</Goal> Aisle 4312xx–4313xx, then 432580. Peers, not targets: who ships
          through what US logistics, who already has a distributor.
        </Slot>
        <Slot t="13:00">
          <Goal>Competitor lap.</Goal> Haimer, BIG, Zoller, Schunk, Kennametal, Rego-Fix, MST, Haas Tooling,
          YG-1, ZCC USA. Ask "what's new," take literature, ask lead times on specials. Photograph automation
          cells with permission.
        </Slot>
        <Slot t="15:30">
          <Goal>MSC 432228, then Shops Zone and CTE.</Goal> Introduce yourself at the Gardner and CTE desks; ask
          if an editor is around.
        </Slot>
        <Slot t="16:30">
          <Ev>Machinists' Hub happy hour</Ev>, 432638. Talk to shop owners, ask the host about a guest slot later
          in the week.
        </Slot>
        <Slot t="evening">
          Marriott Marquis bar. Follow-ups. LinkedIn post #2: three things you learned about shrink fit in
          America today.
        </Slot>
      </Day>

      <Day title="Tuesday 15 · South" meta="10:00–18:00 · reception night">
        <Slot t="9:00">West opens an hour earlier. Use it for anything missed Monday, walk to South by 10.</Slot>
        <Slot t="10:00">
          <Goal>Importers and dealers first.</Goal> Yamazen 338536, Methods 339033, Absolute 339476, Expand
          338045, Koma 338754. Find the tooling person at each.
        </Slot>
        <Slot t="12:30">
          <Goal>Partners and allies.</Goal> Fastems 338966 (ask for Chris Hansen), Xometry 338368, Jingdiao
          339153.
        </Slot>
        <Slot t="14:00">
          <Goal>OEM lap.</Goal> Okuma (Partners in Technology), Mazak, Makino, Hurco/Takumi, Matsuura, Kitamura,
          Hermle, INDEX. Look for dealer badges (Productivity, Morris, Hartwig, Gosiger) at every stand; they are
          the real Tier A here.
        </Slot>
        <Slot t="16:00">
          <Ev>DN Solutions / Ellison reception</Ev>, 338919, 4–7 pm. Stay an hour. <Ev>Haas After-Hours</Ev>,
          338100, 5–6 if you want HFO staff.
        </Slot>
        <Slot t="18:00">
          <Ev>German Night</Ev>, South Building Vista Room Lobby, 6–8 pm. About 350 people; Haimer, Zoller and
          German-owned US shops drink here. Best $85 of the week. Noche Latina (West W196-BC, 5–7:30) is the
          fallback.
        </Slot>
        <Slot t="20:00">Marriott Marquis table. Invite anyone warm. Follow-ups before bed.</Slot>
      </Day>

      <Day title="Wednesday 16 · North" meta="10:00–18:00 · owners' day">
        <Slot t="7:00">
          <Ev>Miles for Manufacturing 5K</Ev>, DuSable Harbor, $40. Optional. AMT staff and exhibitor executives,
          nobody has a booth to hide behind at 7 am.
        </Slot>
        <Slot t="10:00">
          <Goal>Automation.</Goal> Universal Robots, Vention, VersaBuilt, Formic, Flexxbotics, Lang, KUKA,
          Huayan, then the Emerging Technology Center 236700.
        </Slot>
        <Slot t="11:00">
          <Ev>NTMA Technology Luncheon</Ev>, West W474A, 11–1, $65. A room of job shop owners. One rep goes; the
          other keeps North.
        </Slot>
        <Slot t="14:00">
          <Goal>Second pass in West.</Goal> Return to anyone who said "come back" with the sample in hand.
          Machinists' Hub again at happy hour.
        </Slot>
        <Slot t="16:30">
          <Ev>ELEVATE reception</Ev>, West W196 Foyer, $45. Women in Manufacturing and AMT crowd, heavy on plant
          leadership.
        </Slot>
      </Day>

      <Day title="Thursday 17 · East, then Zoller" meta="9:00–17:00 East">
        <Slot t="9:00">
          <Goal>East in one pass.</Goal> Shars 134506, Marposs 134324, Renishaw 134314, TDM 133125, WinTool
          133368, Tech Hub 134476.
        </Slot>
        <Slot t="12:00">
          <Goal>Hot-lead revisits.</Goal> Anyone marked Hot gets a second, longer conversation, ideally over
          coffee away from their booth.
        </Slot>
        <Slot t="15:30">
          <Ev>ZOLLER Toolroom of the Year</Ev>, 432018. Every toolroom manager in the building stands in one spot
          for thirty minutes. Work the edge of the crowd.
        </Slot>
        <Slot t="19:00">Marriott Marquis table. Dinner night: the two or three best leads.</Slot>
      </Day>

      <Day title="Friday 18 · Slow day, deep talks" meta="all halls">
        <Slot t="all day">
          <Goal>Friday is the best day for real conversations.</Goal> Traffic drops, staff are relaxed and bored.
          Competitor reps explain their distribution; distributor candidates have time for thirty minutes. Close
          every open thread on the hit list.
        </Slot>
        <Slot t="15:00">
          Ask exhibitors what happens to demo units at teardown. Presetters and shrink machines get sold or given
          away Saturday; a competitor's demo unit is cheap benchmarking.
        </Slot>
        <Slot t="evening">
          Full follow-up batch. Everyone gets a personal email by Sunday night, before the Sept 24 summit
          headlines change the conversation.
        </Slot>
      </Day>

      <p className="mt-4 text-[14px] text-[var(--muted)]">
        Saturday 19 is optional: student-heavy, teardown mood. Go for teardown deals or a meeting someone
        requested.
      </p>
    </div>
  )
}
