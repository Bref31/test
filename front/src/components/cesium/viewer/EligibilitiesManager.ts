import {
  ArcType,
  CallbackProperty,
  Color,
  JulianDate,
  PositionPropertyArray,
  ReferenceProperty,
  TimeInterval,
} from 'cesium';
import SmartViewer from './SmartViewer';
import { JulianEligibility } from 'store/slices';

export default class EligibilitiesManager {
  smartViewer: SmartViewer;

  constructor(smartViewer: SmartViewer) {
    this.smartViewer = smartViewer;
  }

  setEligibilities(eligibilities: JulianEligibility[]) {
    this.smartViewer.toolbar.eligSelect.style.display = 'initial';
    this.smartViewer.toolbar.eligSelect.selectedIndex = 0;

    for (const eligibility of eligibilities) {
      const references = [
        new ReferenceProperty(
          this.smartViewer.satellites.satellitesCollection[
            this.smartViewer.corresSatConst[eligibility.satelliteId]
          ].entities,
          `SAT_${eligibility.satelliteId}`,
          ['position'],
        ),
        new ReferenceProperty(
          this.smartViewer.stations.stationsCollection.entities,
          `STA_${eligibility.stationId}`,
          ['position'],
        ),
      ];

      const timeInterval = new TimeInterval({
        start: eligibility.start,
        stop: eligibility.end,
        isStartIncluded: true,
        isStopIncluded: true
      })

      this.smartViewer.customPrimCollec.entities.add({
        id: `ELIG_${eligibility.satelliteId}_${eligibility.stationId}_${eligibility.start.toString()}`,
        polyline: {
          positions: new PositionPropertyArray(references),
          width: 2,
          show: new CallbackProperty((time) => TimeInterval.contains(timeInterval, time), false),
          material: Color.BLUEVIOLET,
          arcType: ArcType.NONE,
        },
      });
    }
  }

  removeEligibility() {
    this.smartViewer.toolbar.eligSelect.style.display = 'none';

    const entities = [...this.smartViewer.customPrimCollec.entities.values];
    for (const entity of entities) {
      if (entity.id.startsWith(`ELIG_`)) {
        this.smartViewer.customPrimCollec.entities.removeById(entity.id);
      }
    }
  }
}
