import { System } from 'client/index';
import {
  Cartesian2,
  ClockRange,
  Color,
  ConstantProperty,
  CustomDataSource,
  Entity,
  HorizontalOrigin,
  JulianDate,
  Property,
  VerticalOrigin,
} from 'cesium';
import { SmartEphemeris } from 'store/slices';
import SmartViewer from './SmartViewer';
import { SelectValues } from './ToolbarManager';

const COLOR_ORDER = [Color.BLUE, Color.DARKCYAN, Color.DARKBLUE, Color.DARKSLATEBLUE];

const DEFAULT_LABEL = {
  show: false,
  showBackground: true,
  font: '20px Arial',
  horizontalOrigin: HorizontalOrigin.LEFT,
  verticalOrigin: VerticalOrigin.TOP,
  pixelOffset: new Cartesian2(15, 0),
};

interface SatCollec {
  [constId: string]: CustomDataSource;
}

export default class SatellitesManager {
  smartViewer: SmartViewer;
  satellitesCollection: SatCollec = {};

  constructor(smartViewer: SmartViewer) {
    this.smartViewer = smartViewer;
  }

  setSatellites(system: System, ephemeris: SmartEphemeris) {
    if (system.constellations.length > 1) {
      this.smartViewer.toolbar.constSelect.style.display = 'initial';
    }
    this.smartViewer.toolbar.constSelect.innerHTML = `<option value="${SelectValues.ALL}">All</option>`;
    let i = 0;

    for (const satCollec of Object.values(this.satellitesCollection)) {
      delete this.satellitesCollection[satCollec.name];
      satCollec.entities.removeAll();
      this.smartViewer.viewer.dataSources.remove(satCollec);
    }

    for (const constellation of system.constellations) {
      const newConstCollec = new CustomDataSource(constellation.name);
      const COLOR = COLOR_ORDER[i % COLOR_ORDER.length];
      const satellites = constellation.satellites;

      this.smartViewer.toolbar.constSelect.innerHTML += `<option value="${constellation.id}">${constellation.name}</option>`;

      for (let planeIdx = 0; planeIdx < satellites.length; planeIdx++) {
        for (let satIdx = 0; satIdx < satellites[planeIdx].length; satIdx++) {
          const satId = satellites[planeIdx][satIdx].id;
          if (!ephemeris.ephemeris[satId]) continue;

          const entity = newConstCollec.entities.add({
            id: `SAT_${satId}`,
            point: { pixelSize: 10, color: COLOR },
            position: ephemeris.ephemeris[satId].position,
            label: {
              text: `Satellite (${planeIdx + 1}, ${satIdx + 1})`,
              ...DEFAULT_LABEL,
            },
          }) as Entity & { selected: ConstantProperty };
          entity.addProperty('selected');
          entity.selected = new ConstantProperty(false);
          entity.selected.definitionChanged.addEventListener(() => {
            const selected = entity.selected.getValue() as boolean;
            if (selected) {
              entity.point!.color = new ConstantProperty(Color.RED);
            } else {
              entity.point!.color = new ConstantProperty(COLOR);
            }
          });
          this.smartViewer.corresSatConst[satId] = constellation.id;
        }
      }

      i = i < 3 ? i + 1 : 0;
      this.satellitesCollection[constellation.id] = newConstCollec;
      this.smartViewer.viewer.dataSources.add(newConstCollec);
    }
    const startTime = JulianDate.fromIso8601(ephemeris.horizon.start);
    const endTime = JulianDate.fromIso8601(ephemeris.horizon.end);

    this.smartViewer.viewer.clock.startTime = startTime;
    this.smartViewer.viewer.clock.currentTime = startTime;
    this.smartViewer.viewer.clock.stopTime = endTime;
    this.smartViewer.viewer.clock.clockRange = ClockRange.LOOP_STOP;
    this.smartViewer.viewer.timeline.zoomTo(startTime, endTime);
  }

  removeSatellites() {
    this.smartViewer.toolbar.constSelect.style.display = 'none';
    this.smartViewer.toolbar.topoSelect.style.display = 'none';

    for (const satCollec of Object.values(this.satellitesCollection)) {
      delete this.satellitesCollection[satCollec.name];
      satCollec.entities.removeAll();
      this.smartViewer.viewer.dataSources.remove(satCollec);
    }
  }
}
