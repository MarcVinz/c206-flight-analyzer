import { useState, useEffect } from 'react';
import { Bookmark, Trash2, FolderOpen, Save, Loader2, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { PrepSnapshot } from '@/hooks/useSavedPreps';

interface SavePrepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSnapshot: Omit<PrepSnapshot, 'id' | 'name' | 'savedAt'>;
  savedPreps: PrepSnapshot[];
  onSave: (name: string, snapshot: Omit<PrepSnapshot, 'id' | 'name' | 'savedAt'>) => void;
  onLoad: (prep: PrepSnapshot) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  isOffline?: boolean;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SavePrepDialog({
  open,
  onOpenChange,
  currentSnapshot,
  savedPreps,
  onSave,
  onLoad,
  onDelete,
  isLoading = false,
  isSaving = false,
  saveError = null,
  isOffline = false,
}: SavePrepDialogProps) {
  const [prepName, setPrepName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setDeleteConfirmId(null);
  }, [open]);

  const handleSave = () => {
    if (!prepName.trim()) return;
    onSave(prepName, currentSnapshot);
    setPrepName('');
  };

  const handleLoad = (prep: PrepSnapshot) => {
    onLoad(prep);
    onOpenChange(false);
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3 pr-12 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Sauvegardes de préparation
            {isLoading
              ? <span className="ml-auto" title="Chargement…"><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /></span>
              : isOffline
                ? <span className="ml-auto" title="Hors ligne — cache local utilisé"><CloudOff className="h-3.5 w-3.5 text-destructive" /></span>
                : <span className="ml-auto" title="Synchronisé avec le cloud"><Cloud className="h-3.5 w-3.5 text-green-500" /></span>
            }
          </DialogTitle>
        </DialogHeader>

        {/* Section : sauvegarder la préparation actuelle */}
        <div className="px-5 py-4 border-b border-border/50">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Sauvegarder la préparation actuelle
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Nom de la sauvegarde…"
              value={prepName}
              onChange={(e) => setPrepName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 h-9 text-sm"
              maxLength={50}
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!prepName.trim() || isSaving}
              className="gap-1.5 shrink-0"
            >
              {isSaving
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Save className="h-3.5 w-3.5" />
              }
              Sauver
            </Button>
          </div>
          {saveError && (
            <p className="mt-2 text-xs text-destructive">
              Erreur : {saveError}
            </p>
          )}
        </div>

        {/* Section : liste des sauvegardes */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {savedPreps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Aucune sauvegarde pour l'instant.</p>
              <p className="text-xs mt-1">Saisissez un nom ci-dessus pour enregistrer la préparation courante.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {savedPreps.map((prep) => (
                <li
                  key={prep.id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{prep.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(prep.savedAt)}
                    </p>
                    {(prep.routeFrom || prep.routeTo || prep.pilotName) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[prep.routeFrom, prep.routeTo].filter(Boolean).join(' → ') || '—'}
                        {prep.pilotName ? ` · ${prep.pilotName}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoad(prep)}
                      className="h-8 px-2 gap-1 text-xs"
                      title="Charger cette préparation"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Charger</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={deleteConfirmId === prep.id ? 'destructive' : 'ghost'}
                      onClick={() => handleDeleteClick(prep.id)}
                      className="h-8 w-8 p-0"
                      title={deleteConfirmId === prep.id ? 'Confirmer la suppression' : 'Supprimer'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
