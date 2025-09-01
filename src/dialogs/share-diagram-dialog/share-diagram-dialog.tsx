import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
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
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import { Input } from '@/components/input/input';
import { useDialog } from '@/hooks/use-dialog';

export interface ShareDiagramDialogProps extends BaseDialogProps {}

const encodeBase64 = (str: string): string => {
    // handle unicode safely
    return btoa(unescape(encodeURIComponent(str)));
};

export const ShareDiagramDialog: React.FC<ShareDiagramDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const { closeShareDiagramDialog } = useDialog();
    const [copied, setCopied] = useState(false);

    const shareLink = useMemo(() => {
        if (!currentDiagram) return '';
        const json = diagramToJSONOutput(currentDiagram);
        const encoded = encodeBase64(json);
        const base = window.location.origin + window.location.pathname;
        return `${base}#share=${encoded}`;
    }, [currentDiagram]);

    useEffect(() => {
        if (!dialog.open) setCopied(false);
    }, [dialog.open]);

    const copy = useCallback(async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }, [shareLink]);

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeShareDiagramDialog?.();
                }
            }}
        >
            <DialogContent className="flex max-h-screen flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>{t('share_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('share_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogInternalContent>
                    <div className="flex flex-col gap-2 p-1">
                        <label className="text-sm font-medium">
                            {t('share_dialog.link_label')}
                        </label>
                        <Input readOnly value={shareLink} />
                    </div>
                </DialogInternalContent>
                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('share_dialog.close')}
                        </Button>
                    </DialogClose>
                    <Button onClick={copy} disabled={!shareLink}>
                        {copied
                            ? t('share_dialog.copied')
                            : t('share_dialog.copy')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
