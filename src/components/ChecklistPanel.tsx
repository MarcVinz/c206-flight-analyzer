import { useState, useMemo } from 'react'
import { ClipboardList, CheckCircle, Circle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getChecklistsForAircraft } from '@/data/checklists'
import type { ChecklistSection, ChecklistItem } from '@/data/checklists'

interface ChecklistPanelProps {
  selectedAircraft?: string
}

export function ChecklistPanel({ selectedAircraft = 'ZS-DIT' }: ChecklistPanelProps) {
  const checklists = useMemo(() => getChecklistsForAircraft(selectedAircraft), [selectedAircraft])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleItem = (sectionId: string, itemId: string) => {
    const key = `${sectionId}-${itemId}`
    const newChecked = new Set(checkedItems)
    if (newChecked.has(key)) {
      newChecked.delete(key)
    } else {
      newChecked.add(key)
    }
    setCheckedItems(newChecked)
  }

  const isItemChecked = (sectionId: string, itemId: string) => {
    return checkedItems.has(`${sectionId}-${itemId}`)
  }

  const getSectionProgress = (section: ChecklistSection) => {
    const total = section.items.length
    const checked = section.items.filter((item) =>
      isItemChecked(section.id, item.id)
    ).length
    return { checked, total }
  }

  const resetAll = () => {
    setCheckedItems(new Set())
  }

  const resetSection = (sectionId: string) => {
    const newChecked = new Set(checkedItems)
    for (const key of newChecked) {
      if (key.startsWith(`${sectionId}-`)) {
        newChecked.delete(key)
      }
    }
    setCheckedItems(newChecked)
  }

  const totalChecked = checkedItems.size
  const totalItems = checklists.reduce((sum, section) => sum + section.items.length, 0)

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Checklists</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalChecked}/{totalItems}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="h-8 px-2"
            title="Reset all"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-2"
      >
        {checklists.map((section) => {
          const progress = getSectionProgress(section)
          const isComplete = progress.checked === progress.total

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4 text-aviation-green" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`font-medium ${isComplete ? 'text-aviation-green' : ''}`}>
                      {section.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {progress.checked}/{progress.total}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetSection(section.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Reset
                  </Button>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      sectionId={section.id}
                      isChecked={isItemChecked(section.id, item.id)}
                      onToggle={() => toggleItem(section.id, item.id)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

interface ChecklistItemRowProps {
  item: ChecklistItem
  sectionId: string
  isChecked: boolean
  onToggle: () => void
}

function ChecklistItemRow({ item, isChecked, onToggle }: ChecklistItemRowProps) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
        isChecked
          ? 'bg-aviation-green/10'
          : item.critical
          ? 'bg-aviation-amber/5 hover:bg-aviation-amber/10'
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="mt-0.5">
        {isChecked ? (
          <CheckCircle className="h-4 w-4 text-aviation-green" />
        ) : (
          <Circle className={`h-4 w-4 ${item.critical ? 'text-aviation-amber' : 'text-muted-foreground'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-sm ${
              isChecked
                ? 'line-through text-muted-foreground'
                : item.critical
                ? 'text-aviation-amber font-medium'
                : ''
            }`}
          >
            {item.text}
          </span>
          <span
            className={`text-sm font-mono shrink-0 ${
              isChecked ? 'text-aviation-green' : 'text-muted-foreground'
            }`}
          >
            {item.response}
          </span>
        </div>
      </div>
    </div>
  )
}
