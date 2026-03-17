import { ExternalLink, Phone, Cloud, FileText, BookOpen } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface LinkItemProps {
  href: string
  label?: string
  credentials?: string
}

function LinkItem({ href, label, credentials }: LinkItemProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center gap-1 text-sm font-mono"
      >
        {label ?? href}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
      {credentials && (
        <span className="text-xs text-muted-foreground">({credentials})</span>
      )}
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-primary">{icon}</span>
      <h4 className="font-semibold text-sm uppercase tracking-wide">{title}</h4>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-1 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}

export function UsefulLinksPanel() {
  const { t } = useLanguage()

  return (
    <div className="aviation-card p-5 space-y-6">

      {/* WEATHER */}
      <div>
        <SectionTitle icon={<Cloud className="h-4 w-4" />} title={t('weather')} />
        <div className="space-y-2 pl-1">
          <LinkItem
            href="http://aviation.weathersa.co.za"
            credentials="user: info@bushpilot.co.za / pass: bushpilot"
          />
          <LinkItem href="http://www.weatherphotos.co.za" />
          <LinkItem href="http://www.windy.com" />
          <InfoRow
            label={t('phoneLabel')}
            value="Johannesburg MET — +27 (0)11 3909329 / 3909330"
          />
          <p className="text-xs text-muted-foreground italic mt-1">{t('weatherTip')}</p>
        </div>
      </div>

      <div className="section-divider" />

      {/* FLIGHT PLANS */}
      <div>
        <SectionTitle icon={<FileText className="h-4 w-4" />} title={t('flightPlans')} />
        <div className="space-y-2 pl-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded bg-aviation-amber/15 text-aviation-amber font-semibold px-2 py-0.5 text-xs">
              {t('flightPlanFiled')}
            </span>
            <span className="text-xs text-muted-foreground">{t('flightPlanValid')}</span>
          </div>

          <InfoRow
            label={t('phoneLabel')}
            value="Jo'burg briefing (SA): +27 (0)11 9286517 / 8"
          />

          <div>
            <div className="flex items-center gap-1 text-sm mb-1">
              <span className="text-muted-foreground">{t('onlineLabel')}</span>
              <LinkItem
                href="http://file2fly.atns.co.za"
                credentials="BUSHPILOT / bushpilot"
              />
            </div>

            {/* Tips */}
            <div className="mt-2 ml-3 border-l-2 border-primary/20 pl-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t('flightPlanTips')}</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-none">
                <li className="flex gap-2"><span className="text-primary shrink-0">a)</span>{t('flightPlanTip1')}</li>
                <li className="flex gap-2"><span className="text-primary shrink-0">b)</span>{t('flightPlanTip2')}</li>
                <li className="flex gap-2"><span className="text-primary shrink-0">c)</span>{t('flightPlanTip3')}</li>
                <li>
                  <div className="flex gap-2"><span className="text-primary shrink-0">d)</span>{t('flightPlanField18')}</div>
                  <ul className="mt-1 ml-4 space-y-1 font-mono text-xs">
                    <li>OPR/Bushpilots 0027123486982</li>
                    <li>RMK/SARNIL (if applicable — alt. SARNML)</li>
                    <li>{t('flightPlanTip4')}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">{t('flightPlanRefNote')}</p>
        </div>
      </div>

      <div className="section-divider" />

      {/* NOTAMS & AIPs */}
      <div>
        <SectionTitle icon={<BookOpen className="h-4 w-4" />} title={t('notamsAips')} />
        <div className="space-y-2 pl-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">{t('onlineLabel')}</span>
            <LinkItem
              href="http://file2fly.atns.co.za"
              credentials="BUSHPILOT / bushpilot"
            />
          </div>
          <LinkItem
            href="http://www.caa.co.za"
            label="CAA website"
          />
          <InfoRow
            label={t('phoneLabel')}
            value="Johannesburg briefing — +27 (0)11 9286517 / 8"
          />
        </div>
      </div>

    </div>
  )
}
