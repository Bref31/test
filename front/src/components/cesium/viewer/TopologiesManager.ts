import { ArcType, Color, PositionPropertyArray, ReferenceProperty } from 'cesium';
import SmartViewer from './SmartViewer';
import { TopoWithConstId } from 'store/slices';

enum TopoActions {
  NONE,
  CREATE,
  DELETE,
  CHANGE,
}

export enum TopoName {
  INTRA = 'intra-plane',
  INTER = 'inter-plane',
}

interface TopoCollec {
  [topoId: string]: {
    topoId: string;
    intra: boolean;
    inter: boolean;
  };
}

export default class TopologiesManager {
  smartViewer: SmartViewer;
  topologiesCollection: TopoCollec = {};

  constructor(smartViewer: SmartViewer) {
    this.smartViewer = smartViewer;
  }

  private getStatusTopo(
    constId: string,
    newTopoIds: { topoId: string; constId: string }[],
    topoIds: { topoId: string; constId: string }[],
  ) {
    const oldTopoId = topoIds.find((t) => t.constId === constId);
    const newTopoId = newTopoIds.find((t) => t.constId === constId);

    if (oldTopoId === newTopoId) return TopoActions.NONE;
    if (!oldTopoId && newTopoId) return TopoActions.CREATE;
    if (oldTopoId && !newTopoId) return TopoActions.DELETE;
    if (oldTopoId !== newTopoId) return TopoActions.CHANGE;
  }

  setTopologies(topologies?: { [topoId: string]: TopoWithConstId }) {
    const newTopoConstIds = topologies
      ? Object.entries(topologies).map(([key, value]) => ({
          topoId: key.toString(),
          constId: value.constId.toString(),
        }))
      : [];
    const topoConstIds = Object.entries(this.topologiesCollection).map(
      ([key, value]) => ({
        constId: key,
        topoId: value.topoId,
      }),
    );

    for (const constId of Object.keys(
      this.smartViewer.satellites.satellitesCollection,
    )) {
      const statusTopo = this.getStatusTopo(constId, newTopoConstIds, topoConstIds);

      switch (statusTopo) {
        case TopoActions.CREATE:
          if (!topologies) break;
          this.createTopoLinks(topologies[constId]);
          break;

        case TopoActions.DELETE:
          this.removeTopo(constId);
          break;

        case TopoActions.CHANGE:
          if (!topologies) break;

          this.removeTopo(constId);
          this.createTopoLinks(topologies[constId]);
          break;

        default:
          break;
      }
    }
    this.smartViewer.toolbar.setTopoOptions();
  }

  private getUniqueLink(links: number[][]) {
    const uniqueSet = new Set();
    const finalArray: number[][] = [];

    links.forEach((pair) => {
      const reversedPair = [[pair[0], pair[1]]].toString();

      if (!uniqueSet.has(pair.toString()) && !uniqueSet.has(reversedPair)) {
        uniqueSet.add(pair.toString());
        finalArray.push(pair);
      }
    });

    return finalArray;
  }

  private createTopoLinks(topology: TopoWithConstId) {
    this.topologiesCollection[topology.constId] = {
      topoId: topology.id.toString(),
      inter: !!topology.neighbors[TopoName.INTER],
      intra: !!topology.neighbors[TopoName.INTRA],
    };

    const interLinks = topology.neighbors[TopoName.INTER];
    if (interLinks) {
      this.createTopoLink(
        this.getUniqueLink(interLinks),
        topology.constId.toString(),
        Color.GREEN,
        TopoName.INTER,
      );
    }

    const intraLinks = topology.neighbors[TopoName.INTRA];
    if (intraLinks) {
      this.createTopoLink(
        this.getUniqueLink(intraLinks),
        topology.constId.toString(),
        Color.ORANGE,
        TopoName.INTRA,
      );
    }
  }

  private createTopoLink(
    links: any[][],
    constId: string,
    color: Color,
    name: TopoName,
  ) {
    for (const link of links) {
      const references = [
        new ReferenceProperty(
          this.smartViewer.satellites.satellitesCollection[constId].entities,
          `SAT_${link[0]}`,
          ['position'],
        ),
        new ReferenceProperty(
          this.smartViewer.satellites.satellitesCollection[constId].entities,
          `SAT_${link[1]}`,
          ['position'],
        ),
      ];

      this.smartViewer.customPrimCollec.entities.add({
        id: `TOPO_ConstId-${constId}_${name}_SAT1-${link[0]}_SAT2-${link[1]}`,
        polyline: {
          positions: new PositionPropertyArray(references),
          width: 2,
          material: color,
          arcType: ArcType.NONE,
        },
      });
    }
  }

  removeTopo(constId: string | number) {
    this.smartViewer.toolbar.topoSelect.style.display = 'none';

    const entities = [...this.smartViewer.customPrimCollec.entities.values];
    for (const entity of entities) {
      if (entity.id.startsWith(`TOPO_ConstId-${constId}`)) {
        this.smartViewer.customPrimCollec.entities.removeById(entity.id);
      }
    }
  }
}
