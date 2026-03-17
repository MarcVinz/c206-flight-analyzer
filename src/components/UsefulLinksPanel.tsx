import { ExternalLink, Cloud, FileText, BookOpen, Link, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface LinkButtonProps {
  href: string
  label: string
  credentials?: string
}

function LinkButton({ href, label, credentials }: LinkButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs font-medium border-primary/30 hover:border-primary hover:bg-primary/5"
        onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
      >
        <ExternalLink className="h-3.5 w-3.5 text-primary" />
        {label}
      </Button>
      {credentials && (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {credentials}
        </code>
      )}
    </div>
  )
}

function PhoneRow({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="font-mono text-xs">{value}</span>
    </div>
  )
}

function SectionBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export function UsefulLinksPanel({ showTitle = false }: { showTitle?: boolean }) {
  const { t } = useLanguage()

  return (
    <div className="aviation-card p-5 space-y-4">

      {showTitle && (
        <div className="section-header flex items-center gap-2 mb-2">
          <Link className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('usefulLinks')}</h3>
        </div>
      )}

      {/* WEATHER */}
      <SectionBlock icon={<Cloud className="h-4 w-4" />} title={t('weather')}>
        <LinkButton
          href="https://aviation.weathersa.co.za/#home"
          label="aviation.weathersa.co.za"
          credentials="info@bushpilot.co.za / bushpilot"
        />
        <LinkButton href="http://www.weatherphotos.co.za" label="weatherphotos.co.za" />
        <LinkButton href="http://www.windy.com" label="windy.com" />
        <PhoneRow value="Johannesburg MET — +27 (0)11 3909329 / 3909330" />
        <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">
          {t('weatherTip')}
        </p>
      </SectionBlock>

      {/* FLIGHT PLANS */}
      <SectionBlock icon={<FileText className="h-4 w-4" />} title={t('flightPlans')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-aviation-amber/15 text-aviation-amber font-semibold px-2.5 py-0.5 text-xs">
            {t('flightPlanFiled')}
          </span>
          <span className="text-xs text-muted-foreground">{t('flightPlanValid')}</span>
        </div>

        <PhoneRow value="Jo'burg briefing (SA): +27 (0)11 9286517 / 8" />

        <LinkButton
          href="http://file2fly.atns.co.za"
          label="file2fly.atns.co.za"
          credentials="BUSHPILOT / bushpilot"
        />

        {/* Tips */}
        <div className="rounded bg-muted/40 p-2.5 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('flightPlanTips')}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-1.5"><span className="text-primary font-bold shrink-0">a)</span>{t('flightPlanTip1')}</li>
            <li className="flex gap-1.5"><span className="text-primary font-bold shrink-0">b)</span>{t('flightPlanTip2')}</li>
            <li className="flex gap-1.5"><span className="text-primary font-bold shrink-0">c)</span>{t('flightPlanTip3')}</li>
            <li>
              <div className="flex gap-1.5"><span className="text-primary font-bold shrink-0">d)</span>{t('flightPlanField18')}</div>
              <div className="mt-1 ml-4 space-y-0.5 font-mono text-xs bg-background/60 rounded px-2 py-1.5">
                <div>OPR/Bushpilots 0027123486982</div>
                <div>RMK/SARNIL <span className="text-muted-foreground">(if applicable — alt. SARNML)</span></div>
                <div className="text-muted-foreground not-italic">{t('flightPlanTip4')}</div>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground italic flex gap-1.5">
          <span className="text-aviation-amber shrink-0">→</span>
          {t('flightPlanRefNote')}
        </p>
      </SectionBlock>

      {/* NOTAMS & AIPs */}
      <SectionBlock icon={<BookOpen className="h-4 w-4" />} title={t('notamsAips')}>
        <LinkButton
          href="http://file2fly.atns.co.za"
          label="file2fly.atns.co.za"
          credentials="BUSHPILOT / bushpilot"
        />
        <LinkButton href="http://www.caa.co.za" label="CAA website" />
        <PhoneRow value="Johannesburg briefing — +27 (0)11 9286517 / 8" />
      </SectionBlock>

    </div>
  )
}
