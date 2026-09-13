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
      <h3 className="text-[18px] font-semibold">以弱胜强的打法</h3>
      <p className="my-2 leading-relaxed">
        全是场内战术。这里每一条都是你在 McCormick Place 里、上午 9 点到晚上 6 点之间，没有展位、没有预算也能做的事。
      </p>

      <Play title="背包展位">
        一个 HSK63A，一个 CAT40，手机里一段跳动测试视频，一张二维码卡片。桌子上永远不摆东西。刀柄只有在别人问起，或邀请你进他们展位时才拿出来。手里一个刀柄，能比一个 10x10 的展位引出更多对话，也是走展人能带在身上、展商没法忽视的东西。
      </Play>

      <Play title="看主轴，别看招牌">
        南馆 馆里每个现场切削的展位，主轴里都已经装着我们的产品——只是那个 OEM 自己选的刀柄品牌。走一圈机床，拍下主轴和刀库里装的是什么。到周二晚上你就会知道哪些品牌占了哪些 OEM 展厅，哪些接口是主流（CAT40 BIG-Plus 还是 HSK-A63 还是 Capto），以及该回哪个展位说一句"您那台 VARIAXIS 上用的是 Haimer，我们会这样做不一样的方案"。
      </Play>

      <Play title="要样机刀具清单">
        整周转化率最高的一句话，对 OEM 来说也不花一分钱："把一台样机的刀具清单发给我们，我们免费送一套展厅起步装。"这能把一次冷场的展位闲聊变成一单写着名字的发货。用在 Okuma、Mazak、Makino、Hurco/Takumi、Hermle、Datron、Kern、INDEX、SMEC、Hwacheon 身上。
      </Play>

      <Play title="打时间差">
        西馆 馆 9 点开、17 点关；南馆 和 北馆 是 10 点到 18 点。这就给了你在 Tooling 馆开馆前的一个安静时段，以及 西馆 散场后 南馆 馆的第二个安静时段。任何一个馆开馆的第一个小时和闭馆前三十分钟，展位人员都没人可卖，正好肯聊。冷启动的开场白千万别放在人流高峰。
      </Play>

      <Play title="在 OEM 展位里找代理商">
        Ellison、Productivity、Morris、Hartwig、Gosiger 自己没有展位；他们的销售挂着自己的工牌，站在 Okuma、Mazak、Makino、DN Solutions 的展位里。真正决定新机器配哪条刀具线的就是这些人。Techniks、Lyndex-Nikken、Maritool、Command 的人今年也是以观众身份逛展，同理。过道里每块工牌都看一眼。
      </Play>

      <Play title="拍工牌代替扫码">
        非展商租不到扫码枪，但每块工牌都印着姓名、职位和公司。拍下来，下面配三个词：接口、主轴数量、下一步。走开十秒内就得做，不然到第三个展位细节就忘光了；这一卷照片就是你周日晚上之前的 CRM。
      </Play>

      <Play title="常驻 Machinists' Hub">
        Practical Machinist 每天在我们这个馆的 432638 摊位办讲座、聚会和欢乐时光。每天下午都去，帮主办方打打下手，混成熟脸而不是推销员。周三之前主动要个五分钟嘉宾环节："中国热缩制造商，刚在美国开分公司，来了解美国车间到底要什么"，这种话题正是他们想要的。Creators Lounge 同理，那边的播客主播每天都要从人群里拉一个人做采访。
      </Play>

      <Play title="站在人群本来就聚集的地方">
        免费聚集点比冷清的过道好用：432634 的 Shops Zone 和 432636 的 Manufacturing Showcase 整天都吸引加工车间老板和航空航天买家；432200 的 Community Park 就是给人待着聊天用的；236700 的 Emerging Technology Center 和 Industrial AI Arena 能把人留住二十分钟。整周最好的一场是周四下午 3:30 在 432018 举行的 ZOLLER Toolroom of the Year 颁奖：场上所有的工具室经理，半小时内齐聚一堂。站在人群边上，别往中间挤。
      </Play>

      <Play title="花小钱进场子">
        周二 German Night（85 美元，约 350 人，含 Haimer、Zoller 和德资美国车间）、周三 NTMA 午宴（65 美元，一屋子车间老板）、周三 ELEVATE 招待会（45 美元）、周二 Noche Latina（40 美元）、周二 4 点到 7 点 Ellison/DN 展位招待会和 5 点到 6 点 Haas After-Hours，这两场免费。五个场子加起来不到 250 美元，全是站着端酒杯的老板和经销商。345 美元的 Job Shops Workshop 和 595 美元的 Investor Summit 跳过。
      </Play>

      <Play title="中国同行这周是盟友">
        Bright-Tools、Ounuowei、Jingdiao、ZCC USA、Huayan，还有 432580 的 CMTBA 展位，大家面对的都是同样的关税、物流和经销商难题，而且几乎没有产品线正面竞争。场上多交流。共用一个中西部仓库、共用一家代理公司，或者仅仅知道哪些美国经销商已经回绝过中国品牌，都比白跑一天更值。
      </Play>

      <Play title="访谈已经做成的人">
        431400 的 YG-1 靠 Vernon Hills 仓库、98% 的齐套率和"高性价比"定位，做成了美国市场默认的第二货源。431938 的 ZCC USA 走纯经销商路线，从不主动提原产地。431756 的 Evermore 靠贴别人的牌子卖货。挨个问他们花了多久，走过弯路会跳过什么。跟他们聊二十分钟，比一份市场报告更值，而且他们愿意聊，因为你不跟他们抢展位人流。
      </Play>

      <Play title="没记者证也能上媒体">
        媒体证需要编辑履历，别去申请。换个路子：Cutting Tool Engineering 常驻 432313，天天发 Tooling 馆的简讯；Modern Machine Shop 的编辑就坐在 Shops Zone；Media@IMTS.com 接受一段话的投稿。能上稿的角度不是"我们做刀柄"，而是"一家中国制造商刚在美国开分公司，没订展位就来 IMTS，就为搞清楚美国车间要什么"。上一次行业媒体，值回整周的投入。
      </Play>

      <Play title="每天从展馆现场发一条动态">
        每天一条 LinkedIn，带 #IMTS2026 标签，用学习者而不是推销者的口吻写：看到了什么，一张对方同意拍的展位照片，一个真实的问题。@ 那个展位。展商会转发让自己看起来体面的内容，而他们的粉丝正是我们的目标客户。这是非展商唯一的免费曝光渠道。
      </Play>

      <Play title="周五才是真正的展会">
        人流骤减，展位人员放松又无聊，周二约不到的三十分钟对话，周五毫不费力就能聊上。把所有深入交流和二次拜访都排在周五。然后去问 C 类展位，周六撤展时样机对刀仪和热缩机怎么处理；竞争对手宁可低价出手或直接送人也不愿意装箱运走，捡漏一台打折的竞品机器也是正当的对标研究。
      </Play>

      <Play title="绝对不要">
        在过道、美食区或大堂发传单或样品。到处贴不干胶或标签。展位外摆任何桌子、横幅或快闪摊位，哪怕只是"拍张照"。客户正在跟展位人员说话时插进去推介。在写着禁止拍照的展位里录像。这些每一条都是被清场的触发点，投诉会跟着品牌走很久，工牌被没收之后也甩不掉。
      </Play>
    </div>
  )
}
