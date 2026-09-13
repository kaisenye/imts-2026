import type { ReactNode } from 'react'

function Row({ n, children }: { n: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--line)] py-3 sm:grid-cols-[minmax(0,190px)_1fr] sm:gap-4">
      <div className="font-semibold text-[var(--ink)]">{n}</div>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <small className="ml-1 text-[12px] font-normal text-[var(--muted)]">{children}</small>
}

export default function Numbers() {
  return (
    <div>
      <Row n={<>G2.5 @ 25,000 rpm · &lt;3 µm</>}>
        HIPPSC holder balance and runout spec. Say it before they ask.
      </Row>
      <Row n="$6,785">
        U7 Pro shrink fit machine. The adoption barrier for US shops is the machine, not the holder. This is the
        weapon.
      </Row>
      <Row n="$248.85 / $275.50">
        Our web list price, CAT40 / HSK63A. They will look it up while you talk.
      </Row>
      <Row
        n={
          <>
            $196.30 <Note>Maritool</Note> · ~$420 <Note>Haimer MSRP</Note>
          </>
        }
      >
        The two CAT40 benchmarks in a US buyer's head. We sit between them; justify it with the bundle and
        specials, or move.
      </Row>
      <Row
        n={
          <>
            ~41% <Note>China</Note> · ~15% <Note>Taiwan</Note>
          </>
        }
      >
        Stacked import duty on a tool holder today (3.9% MFN + 25% Section 301 + 12.5% new Section 301). Never
        quote landed cost on the floor. Line: "our US price includes duties, no surprises."
      </Row>
      <Row n="~30%">
        Share of US shops that own a presetter. Seven in ten don't. That is the presetting market.
      </Row>
      <Row
        n={
          <>
            +36% <Note>H1 2026</Note>
          </>
        }
      >
        US machine tool orders vs last year, record half since 1998. Every new 5-axis needs 40–120 holders. Shops
        are short on time and people, not budget.
      </Row>
      <Row n="Sept 24">
        Trump–Xi summit in Washington. Tariff headlines land during follow-up week. Message stays:
        tariff-inclusive pricing, US stock, no surprises.
      </Row>
    </div>
  )
}
