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
        HIPPSC刀柄的动平衡和跳动规格。趁他们开口前先说出来。
      </Row>
      <Row n="$6,785">
        U7 Pro热缩机。美国车间的采用门槛在机器上，不在刀柄上。这是杀手锏。
      </Row>
      <Row n="$248.85 / $275.50">
        我们官网标价，CAT40 / HSK63A。你说话的同时他们会去查这个价。
      </Row>
      <Row
        n={
          <>
            $196.30 <Note>Maritool</Note> · ~$420 <Note>Haimer MSRP</Note>
          </>
        }
      >
        美国买家心里的两个CAT40基准价。我们定位在两者之间；用捆绑方案和特价来解释这个定位，否则就调整。
      </Row>
      <Row
        n={
          <>
            ~41% <Note>中国</Note> · ~15% <Note>台湾</Note>
          </>
        }
      >
        当前刀柄进口叠加关税（3.9% MFN + 25% Section 301 + 12.5% 新增Section 301）。
        在展会现场绝不报到岸成本。说法是："我们的美国价格已含关税，没有意外。"
      </Row>
      <Row n="~30%">
        拥有对刀仪的美国车间占比。七成没有。这就是对刀市场。
      </Row>
      <Row
        n={
          <>
            +36% <Note>2026上半年</Note>
          </>
        }
      >
        美国机床订单同比增幅，为1998年以来最强的上半年。每台新五轴机床需要40–120把刀柄。
        车间缺的是时间和人手，不是预算。
      </Row>
      <Row n="Sept 24">
        特朗普与习近平在华盛顿的峰会。关税新闻会在跟进周出现。话术不变：
        含税定价、美国有现货、没有意外。
      </Row>
    </div>
  )
}
