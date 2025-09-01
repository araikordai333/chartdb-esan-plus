import type { Diagram } from './diagram';

export interface DiagramVersion {
    id: string;
    diagramId: string;
    name: string;
    createdAt: Date;
    // Full snapshot of the diagram at this version
    snapshot: Diagram;
}
