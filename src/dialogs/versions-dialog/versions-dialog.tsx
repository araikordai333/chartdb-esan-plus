import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/input/input';
import { useStorage } from '@/hooks/use-storage';
import { useChartDB } from '@/hooks/use-chartdb';
import { generateId } from '@/lib/utils';
import type { DiagramVersion } from '@/lib/domain/diagram-version';
import { useNavigate } from 'react-router-dom';

export interface VersionsDialogProps extends BaseDialogProps {}

export const VersionsDialog: React.FC<VersionsDialogProps> = ({ dialog }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentDiagram, updateDiagramId, loadDiagramFromData } =
        useChartDB();
    const {
        addDiagramVersion,
        listDiagramVersions,
        deleteDiagramVersion,
        getDiagram,
        addDiagram,
    } = useStorage();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState<DiagramVersion[]>([]);

    const diagramId = currentDiagram?.id;

    const refresh = useCallback(async () => {
        if (!diagramId) return;
        const items = await listDiagramVersions(diagramId);
        setVersions(items);
    }, [diagramId, listDiagramVersions]);

    useEffect(() => {
        if (dialog.open) {
            setName('');
            refresh();
        }
    }, [dialog.open, refresh]);

    const createVersion = useCallback(async () => {
        if (!diagramId) return;
        setLoading(true);
        try {
            const snapshot = await getDiagram(diagramId, {
                includeAreas: true,
                includeCustomTypes: true,
                includeDependencies: true,
                includeRelationships: true,
                includeTables: true,
            });
            if (!snapshot) return;
            const version: DiagramVersion = {
                id: generateId(),
                diagramId,
                name: name?.trim() || new Date().toLocaleString(),
                createdAt: new Date(),
                snapshot,
            };
            await addDiagramVersion({ diagramId, version });
            setName('');
            await refresh();
        } finally {
            setLoading(false);
        }
    }, [diagramId, name, getDiagram, addDiagramVersion, refresh]);

    const restore = useCallback(
        async (v: DiagramVersion) => {
            // Restore as a new diagram and navigate to it
            const newId = generateId();
            const restored = {
                ...v.snapshot,
                id: newId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await addDiagram({ diagram: restored });
            loadDiagramFromData(restored);
            await updateDiagramId(newId);
            navigate(`/diagrams/${newId}`);
        },
        [addDiagram, navigate, loadDiagramFromData, updateDiagramId]
    );

    const remove = useCallback(
        async (v: DiagramVersion) => {
            await deleteDiagramVersion({ diagramId: v.diagramId, id: v.id });
            await refresh();
        },
        [deleteDiagramVersion, refresh]
    );

    const versionNamePlaceholder = t('versions_dialog.name_placeholder');

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    // Close handled by provider
                }
            }}
        >
            <DialogContent className="flex max-h-screen flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>{t('versions_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('versions_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogInternalContent>
                    <div className="flex flex-col gap-3 p-1">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder={versionNamePlaceholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Button onClick={createVersion} disabled={loading}>
                                {t('versions_dialog.create')}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {versions.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    {t('versions_dialog.empty')}
                                </div>
                            ) : (
                                versions.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex items-center gap-2 rounded border p-2"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <div className="truncate font-medium">
                                                {v.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {v.createdAt.toLocaleString()}
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => restore(v)}
                                        >
                                            {t('versions_dialog.restore')}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => remove(v)}
                                        >
                                            {t('versions_dialog.delete')}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogInternalContent>
                <DialogFooter className="flex gap-1 md:justify-end">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('versions_dialog.close')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
