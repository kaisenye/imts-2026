import type { ReactNode } from 'react'

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener"
      target="_blank"
      className="text-[var(--accent-ink)] underline underline-offset-2"
    >
      {children}
    </a>
  )
}

export default function Followup() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold">记录与跟进</h3>
      <p className="my-2 leading-relaxed">
        每次交流都在工牌照片下配同样三行：<strong>是谁</strong>（姓名、公司、职位、他们用的接口）、
        <strong>是什么</strong>（经销商 / OEM / 终端用户 / 集成商 / 媒体；他们对什么反应最大）、
        <strong>下一步</strong>（免费试用五个刀柄、起步单元报价、经销商资料包、引荐、或没有下一步）。每晚更新 Excel 目标名单里的状态列，让两名销售看到的是同一份信息。
      </p>
      <p className="my-2 leading-relaxed">
        跟进邮件当晚就发，用美国邮箱地址发出，120 字以内，具体提一件当次交流的内容，最多一个附件，一个明确的请求并带上日期。周日晚上是整周的截止时间。9 月 21 日周一，9 月 24 日的峰会会占满行业新闻头条；不管头条写什么，我们的说法不变：美国报价含税、美国有库存、没有意外费用。
      </p>
      <p className="my-2 leading-relaxed">
        只给三种方案，仅三种，避免有人临时加出第四种：面向车间和代理商的
        <strong>免费五刀柄试用</strong>；面向车间和 OEM 展厅的<strong>起步单元报价</strong>（U7 Pro 加 20 或 40 个刀柄）；面向渠道伙伴的<strong>经销商资料包</strong>（产品线卡片、价格分级、备货计划、样机外借条款）。三份都做成 PDF 存进手机，周一之前备好。
      </p>
      <p className="my-2 leading-relaxed">
        本周记分卡：记录的交流数、热商机数、开启的渠道或 OEM 洽谈（带明确下一步）数、建立的媒体联系数。四十、十、三、一。
      </p>
      <div className="mt-5 border-t border-[var(--line)] pt-3">
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          <strong>信息来源。</strong> 展位号、展馆与介绍：{' '}
          <A href="https://directory.imts.com/8_0/">IMTS 2026 参展商名录</A>，抓取于 2026 年 9 月 12 日
          （1,752 条记录）。开馆时间、注册、行为规范：{' '}
          <A href="https://www.imts.com/show/faqs.cfm">IMTS 常见问题</A>，{' '}
          <A href="https://www.imts.com/exhibitor/pdf/IMTS2026CompleteRulesRegs_V2.pdf">
            IMTS 2026 规则与条例
          </A>
          。行业板块：{' '}
          <A href="https://www.imts.com/read/article-details/Technology-Evolutions-Drive-IMTS-2026-Floor-Plan-Movement/2100/type/Press-Release/5">
            IMTS 展馆平面图发布
          </A>
          。活动：{' '}
          <A href="https://www.gaccmidwest.org/us/events/german-night-reception-imts-2026-powered-by-wintrust-bank">
            German Night
          </A>
          ，<A href="https://ntma.org/event/imts-2026/">NTMA 午宴</A>，{' '}
          <A href="https://www.imts.com/show/education/Elevate.cfm">ELEVATE</A>，{' '}
          <A href="https://www.imts.com/show/M4M.cfm">Miles for Manufacturing</A>，{' '}
          <A href="https://www.ellisontechnologies.com/imts2026">Ellison / DN 招待会</A>，{' '}
          <A href="https://www.newequipment.com/events/imts/news/55396018/zoller-zoller-to-debut-micro-tool-inspection-and-automation-systems-at-imts-2026">
            Zoller 亮相 IMTS 2026
          </A>
          ，{' '}
          <A href="https://www.prnewswire.com/news-releases/okuma-america-corporation-to-exhibit-at-imts-2026-with-comprehensive-lineup-302834361.html">
            Okuma 亮相 IMTS 2026
          </A>
          。价格：<A href="https://www.hippsc.com/collections/shrink-fit-holders-standard">hippsc.com</A>，{' '}
          <A href="https://www.maritool.com/p17819/CAT40-1/2-SHRINK-FIT-TOOL-HOLDER-.500-3.5/product_info.html">
            Maritool
          </A>
          。关税：{' '}
          <A href="https://ustr.gov/sites/default/files/enforcement/301Investigations/List%201.pdf">
            USTR 301 条款清单 1
          </A>
          ，{' '}
          <A href="https://www.fennemorelaw.com/new-u-s-tariffs-replace-expiring-section-122-tariffs/">
            Fennemore 关于 2026 年 7 月 301 条款行动的解读
          </A>
          ，{' '}
          <A href="https://www.whitecase.com/insight-alert/united-states-terminates-ieepa-based-tariffs-following-supreme-court-decision">
            White &amp; Case 关于 IEEPA 关税终止的解读
          </A>
          ；报到岸成本前务必找持证报关行确认。需求：{' '}
          <A href="https://www.americanmachinist.com/news/news/55397089/machine-tool-demand-is-booming-in-2026-us-manufacturing-technology-orders-report-june-2026">
            USMTO 2026 上半年报告
          </A>
          。地图布局为示意图；建筑位置依据 McCormick Place 的实际布局，图钉位置依据展位号的过道/位置数字。未核实项：Machinists' Hub 欢乐时光的具体时间、IMTS+ 主舞台位置、现场工牌价格。
        </p>
      </div>
    </div>
  )
}
