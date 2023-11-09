import { Station, System } from 'client/index';
import {
  Color,
  ConstantProperty,
  CustomDataSource,
  Entity,
  Property,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';
import { JulianEligibility, SmartEphemeris, TopoWithConstId } from 'store/slices';
import StationsManager from './StationsManager';
import ToolbarManager from './ToolbarManager';
import SatellitesManager from './SatellitesManager';
import TopologiesManager from './TopologiesManager';
import EligibilitiesManager from './EligibilitiesManager';

export default class SmartViewer {
  viewer: Viewer;
  stations: StationsManager;
  toolbar: ToolbarManager;
  satellites: SatellitesManager;
  topologies: TopologiesManager;
  eligibilities: EligibilitiesManager;
  customPrimCollec: CustomDataSource;
  corresSatConst: { [satId: string]: number } = {};

  private handler: ScreenSpaceEventHandler;
  private lastPickedEntity: Entity | undefined;

  constructor(container: string | Element) {
    this.viewer = new Viewer(container, {
      fullscreenButton: false,
      baseLayerPicker: false,
      geocoder: false,
      infoBox: false,
      navigationHelpButton: false,
    });
    this.viewer.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_CLICK,
    );

    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      if (this.viewer.cesiumWidget == null) {
        return;
      }

      const pickedEntity = this.viewer.scene.pick(movement.endPosition);
      let entity: Entity | undefined;

      if (pickedEntity?.id as Entity) {
        entity = pickedEntity.id;
      }

      if (entity?.label) {
        entity.label.show = new ConstantProperty(true);
        entity.point!.pixelSize = new ConstantProperty(16);
      }

      if (this.lastPickedEntity?.label && this.lastPickedEntity !== entity) {
        this.lastPickedEntity.label.show = new ConstantProperty(false);
        this.lastPickedEntity.point!.pixelSize = new ConstantProperty(12);
      }
      this.lastPickedEntity = entity;
    }, ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.viewer.cesiumWidget == null) {
        return;
      }

      const pickedEntity = this.viewer.scene.pick(movement.position);
      let entity: (Entity & { selected: ConstantProperty }) | undefined;

      if (pickedEntity?.id as Entity) {
        entity = pickedEntity.id;
      }

      if (!entity) {
        return;
      }

      if (entity.selected.getValue()) {
        entity.selected.setValue(false);
      } else {
        entity.selected.setValue(true);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.toolbar = new ToolbarManager(this);
    this.stations = new StationsManager(this);
    this.satellites = new SatellitesManager(this);
    this.topologies = new TopologiesManager(this);
    this.eligibilities = new EligibilitiesManager(this);

    // Used to avoid primitives errors
    // -- Cannot use callback property / property ref inside a primitive
    // -- Cannot delete multiple datasource with primitives inside
    this.customPrimCollec = new CustomDataSource('customPrimCollec');
    this.viewer.dataSources.add(this.customPrimCollec);
  }

  setStations(stations: Station[]) {
    this.stations.setStations(stations);
  }

  removeStation() {
    this.stations.removeStation();
  }

  setSatellites(system: System, ephemeris: SmartEphemeris) {
    this.corresSatConst = {};
    this.satellites.setSatellites(system, ephemeris);
  }

  removeSatellites() {
    this.satellites.removeSatellites();
  }

  setTopologies(topologies?: { [constId: string]: TopoWithConstId }) {
    this.topologies.setTopologies(topologies);
  }

  removeTopo(constId: string | number) {
    this.topologies.removeTopo(constId);
  }

  setEligibilities(eligibilities: JulianEligibility[]) {
    this.eligibilities.setEligibilities(eligibilities);
  }

  removeEligibility() {
    this.eligibilities.removeEligibility();
  }

  cleanup() {
    this.viewer.entities.removeAll();
    this.viewer.destroy();
  }
}
