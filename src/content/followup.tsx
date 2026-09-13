import type { ReactNode } from 'react'

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener"
      target="_blank"
      className="text-[var(--color-accent-ink)] underline underline-offset-2"
    >
      {children}
    </a>
  )
}

export default function Followup() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold">Capture and follow-up</h3>
      <p className="my-2 leading-relaxed">
        Every conversation gets the same three lines under the badge photo: <strong>who</strong> (name, company,
        role, interface they run), <strong>what</strong> (distributor / OEM / end user / integrator / press; what
        they reacted to), <strong>next</strong> (free 5-holder trial, starter-cell quote, distributor pack,
        intro, nothing). Update the Status column in the Excel target list nightly so both reps see the same
        picture.
      </p>
      <p className="my-2 leading-relaxed">
        Follow-up email goes out the same night, from the US address, under 120 words, one specific reference to
        the conversation, one attachment at most, one clear ask with a date. Sunday night is the deadline for the
        whole week. On Monday the 21st the Sept 24 summit dominates trade news; whatever the headline, our line
        stays the same: US price includes duty, stock in the US, no surprises.
      </p>
      <p className="my-2 leading-relaxed">
        Three offers, only three, so nobody improvises a fourth: the <strong>free five-holder trial</strong> for
        shops and dealers; the <strong>starter cell quote</strong> (U7 Pro plus 20 or 40 holders) for shops and
        OEM showrooms; the <strong>distributor pack</strong> (line card, pricing tiers, stocking program,
        demo-machine loan terms) for channel partners. All three as PDFs on the phone before Monday.
      </p>
      <p className="my-2 leading-relaxed">
        Scorecard for the week: conversations logged, hot leads, channel or OEM talks opened with a named next
        step, press contacts made. Forty, ten, three, one.
      </p>
      <div className="mt-5 border-t border-[var(--line)] pt-3">
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          <strong>Sources.</strong> Booth numbers, halls and descriptions:{' '}
          <A href="https://directory.imts.com/8_0/">IMTS 2026 exhibitor directory</A>, pulled Sept 12, 2026
          (1,752 records). Hours, registration, conduct:{' '}
          <A href="https://www.imts.com/show/faqs.cfm">IMTS FAQ</A>,{' '}
          <A href="https://www.imts.com/exhibitor/pdf/IMTS2026CompleteRulesRegs_V2.pdf">
            IMTS 2026 Rules &amp; Regulations
          </A>
          . Sectors:{' '}
          <A href="https://www.imts.com/read/article-details/Technology-Evolutions-Drive-IMTS-2026-Floor-Plan-Movement/2100/type/Press-Release/5">
            IMTS floor plan release
          </A>
          . Events:{' '}
          <A href="https://www.gaccmidwest.org/us/events/german-night-reception-imts-2026-powered-by-wintrust-bank">
            German Night
          </A>
          , <A href="https://ntma.org/event/imts-2026/">NTMA luncheon</A>,{' '}
          <A href="https://www.imts.com/show/education/Elevate.cfm">ELEVATE</A>,{' '}
          <A href="https://www.imts.com/show/M4M.cfm">Miles for Manufacturing</A>,{' '}
          <A href="https://www.ellisontechnologies.com/imts2026">Ellison / DN reception</A>,{' '}
          <A href="https://www.newequipment.com/events/imts/news/55396018/zoller-zoller-to-debut-micro-tool-inspection-and-automation-systems-at-imts-2026">
            Zoller at IMTS 2026
          </A>
          ,{' '}
          <A href="https://www.prnewswire.com/news-releases/okuma-america-corporation-to-exhibit-at-imts-2026-with-comprehensive-lineup-302834361.html">
            Okuma at IMTS 2026
          </A>
          . Pricing: <A href="https://www.hippsc.com/collections/shrink-fit-holders-standard">hippsc.com</A>,{' '}
          <A href="https://www.maritool.com/p17819/CAT40-1/2-SHRINK-FIT-TOOL-HOLDER-.500-3.5/product_info.html">
            Maritool
          </A>
          . Tariffs:{' '}
          <A href="https://ustr.gov/sites/default/files/enforcement/301Investigations/List%201.pdf">
            USTR Section 301 List 1
          </A>
          ,{' '}
          <A href="https://www.fennemorelaw.com/new-u-s-tariffs-replace-expiring-section-122-tariffs/">
            Fennemore on the July 2026 Section 301 action
          </A>
          ,{' '}
          <A href="https://www.whitecase.com/insight-alert/united-states-terminates-ieepa-based-tariffs-following-supreme-court-decision">
            White &amp; Case on IEEPA termination
          </A>
          ; confirm with a licensed broker before quoting landed cost. Demand:{' '}
          <A href="https://www.americanmachinist.com/news/news/55397089/machine-tool-demand-is-booming-in-2026-us-manufacturing-technology-orders-report-june-2026">
            USMTO H1 2026
          </A>
          . Map geometry is schematic; building placement follows McCormick Place's layout, pins follow
          booth-number aisle/position digits. Unverified: Machinists' Hub happy-hour times, IMTS+ Main Stage
          location, on-site badge price.
        </p>
      </div>
    </div>
  )
}
