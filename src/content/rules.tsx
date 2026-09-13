export default function Rules() {
  return (
    <div>
      <p className="my-2 leading-relaxed">
        IMTS publishes no attendee suitcasing policy. The exhibitor contract does the policing and enforcement is
        complaint-driven: an exhibitor whose staff you pitch during their rush calls show management, and Section
        VIII lets AMT pull any badge. Stay on the right side of these lines and nobody bothers you all week.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <b className="block text-[var(--accent-ink)]">Fine</b>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Conversations anywhere. Cards one-to-one.</li>
            <li>Samples in a backpack. Show one when asked or invited into a booth.</li>
            <li>Meetings in hotel bars, suites, restaurants. Every OEM does it.</li>
            <li>Photos of aisles and wide shots. Inside a booth, ask first.</li>
            <li>Daily LinkedIn posts with partner booths tagged, with their OK.</li>
            <li>Paid receptions and conferences. Any badge covers all six days of exhibits.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <b className="block">Gets you ejected</b>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Brochures, flyers or samples handed out in aisles, food courts or lobbies. Sec. XXX: distribution
              only from within a booth.
            </li>
            <li>Stickers or labels anywhere.</li>
            <li>Any table, banner or display outside a booth.</li>
            <li>Pitching booth staff while customers wait.</li>
            <li>Filming inside a no-photo booth, or after close.</li>
            <li>Registering sales staff as media.</li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-[14px] text-[var(--muted)]">
        Business casual, branded polo, shoes for eight hours. Badge must read your real title and "HIPPSC USA":
        exhibitors scan you, and that scan is how you land in their CRM.
      </p>
    </div>
  )
}
