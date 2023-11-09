import { Station } from 'client/index';
import {
  Cartesian2,
  Cartesian3,
  Color,
  CustomDataSource,
  HorizontalOrigin,
  VerticalOrigin,
} from 'cesium';
import SmartViewer from './SmartViewer';

const COLLECTION_NAME = 'stations';

const DEFAULT_LABEL = {
  show: false,
  showBackground: true,
  font: '20px Arial',
  horizontalOrigin: HorizontalOrigin.LEFT,
  verticalOrigin: VerticalOrigin.TOP,
  pixelOffset: new Cartesian2(15, 0),
};

export default class StationsManager {
  smartViewer: SmartViewer;
  stationsCollection: CustomDataSource;

  constructor(smartViewer: SmartViewer) {
    this.smartViewer = smartViewer;
    this.stationsCollection = new CustomDataSource(COLLECTION_NAME);
    this.smartViewer.viewer.dataSources.add(this.stationsCollection);
  }

  setStations(stations: Station[]) {
    this.stationsCollection.entities.removeAll();

    for (const station of stations) {
      this.stationsCollection.entities.add({
        id: `STA_${station.id}`,
        point: { pixelSize: 12, color: Color.BROWN },
        position: Cartesian3.fromDegrees(
          station.location.longitudeDeg,
          station.location.latitudeDeg,
        ),
        label:
          !station.city && !station.country
            ? undefined
            : {
                text: `${station.country} - ${station.city}`,
                ...DEFAULT_LABEL,
              },
      });
    }
  }

  removeStation() {
    this.stationsCollection.entities.removeAll();
  }
}
