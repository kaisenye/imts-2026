import type { ReactNode } from 'react'

function Script({ lab, children }: { lab: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-ink)]">
        {lab}
      </div>
      {children}
    </div>
  )
}

function Q({ children }: { children: ReactNode }) {
  return <q className="italic">{children}</q>
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[14px] text-[var(--muted)]">{children}</p>
}

function Obj({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--line)] py-3 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-4">
      <div className="font-semibold">{q}</div>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

export default function Scripts() {
  return (
    <div>
      <Script lab="Ten seconds, anyone">
        <p className="mt-2 leading-relaxed">
          <Q>
            HIPPSC. We make shrink fit tool holders, shrink fit machines and presetters in China, and we just
            opened a US branch. No booth this year; I'm here to find the right partners and learn what American
            shops actually want. Who handles tooling at your company?
          </Q>
        </p>
        <Note>
          Say China in the first sentence. Hiding it costs trust later; saying it early makes it their least
          interesting fact about you.
        </Note>
      </Script>

      <Script lab="Distributor or importer">
        <p className="mt-2 leading-relaxed">
          <Q>
            You carry Techniks or Haimer today. We'd be your value shrink-fit line or your private label: HSK,
            CAT and BT, balanced G2.5 at 25,000, under 3 microns, and a $6,800 shrink machine you can bundle.
            Protected distributor pricing, a stocking program, a demo machine on loan. Who decides new lines, and
            what does onboarding look like?
          </Q>
        </p>
        <p className="mt-2 leading-relaxed">
          On direct sales from our site:{' '}
          <Q>The site stays at list; distributor pricing sits under it and we hold MAP.</Q> Say this only if
          HIPPSC will honor it; confirm Sunday.
        </p>
      </Script>

      <Script lab="Machine tool OEM or dealer">
        <p className="mt-2 leading-relaxed">
          <Q>
            Every 5-axis you install needs 40 to 120 holders, and the customer buys them in the first month. We'd
            like to be the tooling package on your demo machines. Send us one machine's tool list and we ship a
            free starter set for your showroom. Who runs your demo builds?
          </Q>
        </p>
      </Script>

      <Script lab="Shop owner or shop manager">
        <p className="mt-2 leading-relaxed">
          <Q>
            A shrink fit cell for the price of a hydraulic chuck set: machine plus twenty holders. Try five
            holders free on whatever shrink machine you run today; the geometry is standard. If they don't hold
            under 3 microns on your gauge, keep them anyway.
          </Q>
        </p>
        <Note>
          Ask what interface they run (CAT40, BT40, HSK63A, BBT) and how many spindles. Write both on the badge
          photo.
        </Note>
      </Script>

      <Script lab="Automation integrator">
        <p className="mt-2 leading-relaxed">
          <Q>
            You build the cell; we make the shrink and preset station that feeds it. Low-cost module, no software
            subscription, offset output to Fanuc, Siemens, Heidenhain and Haas. Want a tool-setup option in your
            machine-tending offering?
          </Q>
        </p>
      </Script>

      <Script lab="Competitor booth">
        <p className="mt-2 leading-relaxed">
          Do not pitch. <Q>What's new for you this year?</Q>{' '}
          <Q>What's the lead time on a special gauge length HSK100 right now?</Q>{' '}
          <Q>Who do you sell through in Southern California?</Q> Thank them, take the literature, leave.
        </p>
      </Script>

      <h3 className="mt-6 text-[18px] font-semibold">Objections you will hear</h3>
      <div className="mt-2">
        <Obj q={'"Chinese holders? No."'}>
          Certificate per holder (runout, balance grade, hardness, taper AT3), runout stand on video, 30-day
          returns, five free holders on their own machine. Then stop talking about origin.
        </Obj>
        <Obj q={'"Tariffs make you expensive."'}>
          US price already includes duty, no surprises at customs. The value is the bundle and specials lead
          time, not the holder price. Never quote landed cost on the floor.
        </Obj>
        <Obj q={'"We do defense / ITAR work."'}>
          Tool holders are not deliverables, so DFARS specialty-metals doesn't reach them. Presetter software
          runs offline, no cloud, no remote diagnostics; fits a CMMC shop. HIPPSC is not on the 1260H list. Offer
          the one-page trade-compliance sheet.
        </Obj>
        <Obj q={'"Who services the machine?"'}>
          US technician, spare coils and stop discs in stock, loaner policy. If any of that isn't true yet, say
          what is true and when the rest arrives.
        </Obj>
        <Obj q={'"I buy everything through MSC / my distributor."'}>
          Name the distributors you're onboarding (Tier A this week). Offer a direct account on net 30 as a
          bridge.
        </Obj>
        <Obj q={'"Do you have 3D models?"'}>
          STEP files and a tool library download. If the library isn't ready, promise a date and keep it.
        </Obj>
        <Obj q={'"Hydraulic is easier, no machine."'}>
          Agree, for one-offs. Shrink wins on runout, rigidity, slim reach into 5-axis pockets, and cost per
          holder once you own the machine, and ours is the cheapest credible one on the floor.
        </Obj>
      </div>
    </div>
  )
}
