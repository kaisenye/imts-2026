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
        两人组：一人守西馆，一人守南馆，周三互换。一人组：按计划顺序走。每天结束前必须发完跟进邮件；商机拖到周日就凉了。
      </p>

      <Day title="周日 13日 · 起点日" meta="筹备">
        <Slot t="上午">
          <Goal>装备。</Goal> 背包里放一支HSK63A和一支CAT40，手机里存一段跳动演示视频，二维码卡片打开"HIPPSC
          参展 IMTS，预约15分钟"页面并带展会优惠（免费试用5支刀柄），带上规格书PDF，名片印上美国地址和电话。带两个充电宝；展馆WiFi只有768
          kbps，靠蜂窝网络。
        </Slot>
        <Slot t="中午">
          <Goal>展前邮件。</Goal> Media@IMTS.com、CTE编辑、MMS：一段话说清楚，提出10分钟边走边聊。在LinkedIn上私信三位播客主（MakingChips、Manufacturing
          Happy Hour、Mavens of Manufacturing）；他们在现场录节目，需要嘉宾。订好Marriott Marquis的桌子，周二晚8点、周四晚7点。
        </Slot>
        <Slot t="晚上">
          <Goal>门票。</Goal> German Night（$85）、Noche Latina（$40）、ELEVATE酒会（$45）、NTMA午餐会（$65）。四场加起来不到$250，覆盖满屋子的老板和经销商。LinkedIn第1条帖子："落地芝加哥。六天，没有展位，见到每个美国厂子只问一个问题。"{' '}
          <Ev>可选：DMG MORI Innovation Days今天在Hoffman Estates开幕。</Ev>
        </Slot>
      </Day>

      <Day title="周一 14日 · 西馆" meta="9:00–17:00">
        <Slot t="9:00">
          <Goal>趁人少扫西馆的一级分销商和进口商。</Goal> Tool Holder Shop、Accutek、PAC、Delton、Royal、Omega
          TMM、Global CNC、Platinum、iSwiss、Euro-Tech、JM Performance。工作人员刚上岗，还没客人。每家十分钟，两个问题，拍胸卡，走人。
        </Slot>
        <Slot t="11:00">
          <Goal>中国展商聚集区和CMTBA。</Goal> 通道4312xx–4313xx，然后432580。这些是同行不是目标：问他们走哪条美国物流，谁已经有经销商了。
        </Slot>
        <Slot t="13:00">
          <Goal>竞品巡场。</Goal> Haimer、BIG、Zoller、Schunk、Kennametal、Rego-Fix、MST、Haas
          Tooling、YG-1、ZCC USA。问"有什么新东西"，拿资料，问特价款交期。征得同意后拍自动化产线照片。
        </Slot>
        <Slot t="15:30">
          <Goal>MSC 432228，然后Shops Zone和CTE。</Goal> 在Gardner和CTE展台自我介绍；问问编辑在不在。
        </Slot>
        <Slot t="16:30">
          <Ev>Machinists' Hub欢乐时光酒会</Ev>，432638。找车间老板聊，问主办方本周晚些时候能不能给个嘉宾席位。
        </Slot>
        <Slot t="晚上">
          Marriott Marquis酒吧。跟进。LinkedIn第2条帖子：今天在美国学到的三件关于热缩的事。
        </Slot>
      </Day>

      <Day title="周二 15日 · 南馆" meta="10:00–18:00 · 酒会之夜">
        <Slot t="9:00">西馆早开一小时。用来补周一漏掉的，10点前走去南馆。</Slot>
        <Slot t="10:00">
          <Goal>先跑进口商和代理商。</Goal> Yamazen 338536、Methods 339033、Absolute 339476、Expand
          338045、Koma 338754。找到每家负责刀具的人。
        </Slot>
        <Slot t="12:30">
          <Goal>合作伙伴和盟友。</Goal> Fastems 338966（找Chris Hansen）、Xometry 338368、Jingdiao 339153。
        </Slot>
        <Slot t="14:00">
          <Goal>主机厂巡场。</Goal> Okuma（Partners in Technology）、Mazak、Makino、Hurco/Takumi、Matsuura、Kitamura、Hermle、INDEX。每个展台都留意代理商胸卡（Productivity、Morris、Hartwig、Gosiger）；他们才是这里真正的一级目标。
        </Slot>
        <Slot t="16:00">
          <Ev>DN Solutions / Ellison酒会</Ev>，338919，下午4–7点。待一小时。<Ev>Haas After-Hours</Ev>，338100，5–6点，如果想见HFO的人。
        </Slot>
        <Slot t="18:00">
          <Ev>German Night</Ev>，南馆 Building Vista Room Lobby，晚6–8点。约350人；Haimer、Zoller和德资美国工厂都在这喝酒。这周最值的$85。Noche
          Latina（西馆 W196-BC，5–7:30）是备选。
        </Slot>
        <Slot t="20:00">Marriott Marquis的桌子。约上所有热乎的商机。睡前跟进完。</Slot>
      </Day>

      <Day title="周三 16日 · 北馆" meta="10:00–18:00 · 老板日">
        <Slot t="7:00">
          <Ev>Miles for Manufacturing 5K</Ev>，DuSable Harbor，$40。可选。AMT员工和参展商高管都在，早上7点没人躲在展位后面。
        </Slot>
        <Slot t="10:00">
          <Goal>自动化。</Goal> Universal Robots、Vention、VersaBuilt、Formic、Flexxbotics、Lang、KUKA、Huayan，然后是Emerging
          Technology Center 236700。
        </Slot>
        <Slot t="11:00">
          <Ev>NTMA Technology Luncheon</Ev>，西馆 W474A，11–1点，$65。满屋子加工车间老板。一人去；另一人守北馆。
        </Slot>
        <Slot t="14:00">
          <Goal>西馆第二轮。</Goal> 回访说过"再来"的人，带上样品。欢乐时光再去一次Machinists' Hub。
        </Slot>
        <Slot t="16:30">
          <Ev>ELEVATE酒会</Ev>，西馆 W196 Foyer，$45。Women in Manufacturing和AMT的人，多是工厂管理层。
        </Slot>
      </Day>

      <Day title="周四 17日 · 东馆，然后Zoller" meta="9:00–17:00 东馆">
        <Slot t="9:00">
          <Goal>东馆一趟扫完。</Goal> Shars 134506、Marposs 134324、Renishaw 134314、TDM 133125、WinTool
          133368、Tech Hub 134476。
        </Slot>
        <Slot t="12:00">
          <Goal>重点商机回访。</Goal> 每个标记为重点的商机都要再谈一次，最好离开展位找地方喝咖啡细聊。
        </Slot>
        <Slot t="15:30">
          <Ev>ZOLLER Toolroom of the Year</Ev>，432018。全场刀具室经理三十分钟内都聚在这一个点。在人群边上找机会。
        </Slot>
        <Slot t="19:00">Marriott Marquis的桌子。晚餐夜：请最好的两三个商机。</Slot>
      </Day>

      <Day title="周五 18日 · 慢节奏日，深聊" meta="全部展馆">
        <Slot t="全天">
          <Goal>周五是深聊的最佳日子。</Goal> 人流下降，工作人员放松也无聊。竞品代表会跟你讲他们的渠道；候选经销商也有空聊三十分钟。清完清单上所有未闭环的线索。
        </Slot>
        <Slot t="15:00">
          问参展商撤展时演示机怎么处理。对刀仪和热缩机周六会卖掉或送人；竞品的演示机是便宜的对标机会。
        </Slot>
        <Slot t="晚上">
          集中处理所有跟进。周日晚前给每个人发一封私人邮件，赶在9月24日峰会新闻改变话题之前。
        </Slot>
      </Day>

      <p className="mt-4 text-[14px] text-[var(--muted)]">
        周六 19日可选：学生多，撤展气氛。去谈撤展优惠或赴约已定好的会面。
      </p>
    </div>
  )
}
