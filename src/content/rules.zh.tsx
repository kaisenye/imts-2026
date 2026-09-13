export default function Rules() {
  return (
    <div>
      <p className="my-2 leading-relaxed">
        IMTS没有公开的观众蹭展政策。参展商合同负责约束，执行靠投诉驱动：如果参展商的工作人员在他们最忙的时候
        被你推销并投诉到主办方，Section VIII允许AMT没收任何人的胸卡。守住这些底线，整周都不会有人来找你麻烦。
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <b className="block text-[var(--accent-ink)]">可以做</b>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            <li>随处交谈。一对一发名片。</li>
            <li>样品放背包里带着。有人问起或被邀入展位时再拿出来。</li>
            <li>在酒店酒吧、套房、餐厅谈生意。每个OEM都这么干。</li>
            <li>拍走道和大场景照片。在展位内部拍照先问一声。</li>
            <li>每天在LinkedIn发帖，标记合作方展位，需对方同意。</li>
            <li>参加付费酒会和会议。任何一种胸卡都能覆盖全部六天的展览。</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <b className="block">会被清场</b>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              在过道、美食广场或大厅里发放宣传册、传单或样品。Sec. XXX：分发只能在展位内部进行。
            </li>
            <li>在任何地方贴贴纸或标签。</li>
            <li>展位外摆放任何桌子、横幅或展示物。</li>
            <li>在客户等候时向展位工作人员推销。</li>
            <li>在禁止拍照的展位内拍摄，或闭馆后拍摄。</li>
            <li>把销售人员登记成媒体。</li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-[14px] text-[var(--muted)]">
        商务休闲装，品牌Polo衫，能站八小时的鞋。胸卡必须显示真实职位和"HIPPSC USA"：
        参展商会扫描你的胸卡，那次扫描就是你进入他们CRM的方式。
      </p>
    </div>
  )
}
