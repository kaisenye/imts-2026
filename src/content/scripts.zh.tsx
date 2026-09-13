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
      <Script lab="十秒钟，见谁都能说">
        <p className="mt-2 leading-relaxed">
          <Q>
            HIPPSC。我们在中国生产热缩刀柄、热缩机和对刀仪，刚在美国开了分公司。今年没展位，我来是想找对的合作伙伴，看看美国的车间到底要什么。您那边刀具是谁负责？
          </Q>
        </p>
        <Note>
          第一句话就说中国。藏着不说，后面反而失信；早说出来，反倒成了对方最不在意的一点。
        </Note>
      </Script>

      <Script lab="经销商或进口商">
        <p className="mt-2 leading-relaxed">
          <Q>
            您现在代理 Techniks 或 Haimer。我们可以做您的性价比热缩产品线，也可以贴牌：HSK、CAT、BT，25,000
            转下动平衡 G2.5，跳动小于 3 微米，热缩机 6,800 美元还能打包卖。经销商保护价、备货计划、样机外借。新产品线是谁拍板？入库流程是怎样的？
          </Q>
        </p>
        <p className="mt-2 leading-relaxed">
          关于官网直销：
          <Q>{'官网价格维持零售价，经销商价格在此之下，我们守 MAP（最低广告价）。'}</Q>
          只有 HIPPSC 真能做到才这么说；周日之前要确认。
        </p>
      </Script>

      <Script lab="机床厂商或代理商">
        <p className="mt-2 leading-relaxed">
          <Q>
            每台五轴机上市都要配 40 到 120 个刀柄，客户第一个月就得买。我们想成为您样机上的刀具配套。把一台机床的刀具清单发给我们，我们免费送一套展厅起步装。您那边样机是谁负责的？
          </Q>
        </p>
      </Script>

      <Script lab="车间老板或车间经理">
        <p className="mt-2 leading-relaxed">
          <Q>
            一套液压刀柄的价钱，换一整套热缩单元：机器加二十个刀柄。您现在用哪台热缩机都行，先免费试五个刀柄，柄形是标准的。要是在您那台量具上测不到 3 微米以内，刀柄也留着不用还。
          </Q>
        </p>
        <Note>
          问清楚他们用什么接口（CAT40、BT40、HSK63A、BBT），有几个主轴。两样都写在工牌照片下面。
        </Note>
      </Script>

      <Script lab="自动化集成商">
        <p className="mt-2 leading-relaxed">
          <Q>
            您做产线，我们做给产线供料的热缩加对刀工位。模块成本低，不用订阅软件，偏置数据输出兼容 Fanuc、Siemens、Heidenhain、Haas。您的机床上下料方案里要不要加一个对刀选项？
          </Q>
        </p>
      </Script>

      <Script lab="遇到竞争对手的展位">
        <p className="mt-2 leading-relaxed">
          别推介。<Q>今年有什么新东西？</Q> <Q>现在特殊柄长的 HSK100 交期多久？</Q>{' '}
          <Q>您在南加州通过谁分销？</Q> 道谢，拿资料，走人。
        </p>
      </Script>

      <h3 className="mt-6 text-[18px] font-semibold">你会遇到的反对意见</h3>
      <div className="mt-2">
        <Obj q={'"中国刀柄？不用了。"'}>
          每个刀柄配证书（跳动、动平衡等级、硬度、锥度 AT3），跳动测试录像，30 天退货，免费拿五个刀柄上他们自己的机器试。之后就别再提原产地了。
        </Obj>
        <Obj q={'"关税让你们变贵了。"'}>
          美国报价已经含税，清关不会有意外费用。价值在于打包方案和特殊规格的交期，不是刀柄本身的价格。展位上绝不报到岸成本。
        </Obj>
        <Obj q={'"我们做国防 / ITAR 相关业务。"'}>
          刀柄不算交付件，所以 DFARS 特种金属条款管不到它们。对刀仪软件离线运行，不联云、不远程诊断，符合 CMMC 车间要求。HIPPSC 不在 1260H 名单上。可以给他们那份一页纸的贸易合规说明。
        </Obj>
        <Obj q={'"机器谁来维修？"'}>
          美国本地技术员，弹簧线圈和止动片备件在库，有借用政策。如果哪条还没做到，就说清楚现状和什么时候能到位。
        </Obj>
        <Obj q={'"我们都通过 MSC / 我的经销商采购。"'}>
          说出你正在开发的经销商名字（本周的 A 类名单）。可以提供直客账户、月结 30 天，作为过渡方案。
        </Obj>
        <Obj q={'"有没有 3D 模型？"'}>
          有 STEP 文件和刀具库下载。库还没准备好的话，给个确切日期，并说到做到。
        </Obj>
        <Obj q={'"液压更方便，不用机器。"'}>
          单件确实如此，认同。但热缩在跳动、刚性、深入五轴狭窄型腔，以及买了机器之后的单件成本上都更占优，而且我们的热缩机是现场最便宜、也最靠谱的一款。
        </Obj>
      </div>
    </div>
  )
}
