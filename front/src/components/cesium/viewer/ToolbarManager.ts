import store from 'store';
import SmartViewer from './SmartViewer';
import { ConstantProperty } from 'cesium';

export enum SelectValues {
  ALL = 'all',
  INTRA = 'intra',
  INTER = 'inter',
  NONE = 'none',
}

export default class ToolbarManager {
  smartViewer: SmartViewer;
  private toolbar: HTMLElement | null;
  private modeButton: HTMLElement | null;
  clockResetButton: HTMLButtonElement;
  constSelect: HTMLSelectElement;
  topoSelect: HTMLSelectElement;
  eligSelect: HTMLSelectElement;

  constructor(smartViewer: SmartViewer) {
    this.smartViewer = smartViewer;

    this.toolbar = document.querySelector('div.cesium-viewer-toolbar');
    this.modeButton = document.querySelector(
      'span.cesium-sceneModePicker-wrapper',
    );

    this.clockResetButton = this.createResetButton();
    this.constSelect = this.createConstSelect();
    this.topoSelect = this.createTopoSelect();
    this.eligSelect = this.createEligSelect();

    this.toolbar?.insertBefore(this.clockResetButton, this.modeButton);
    this.toolbar?.insertBefore(this.constSelect, this.modeButton);
    this.toolbar?.insertBefore(this.topoSelect, this.modeButton);
    this.toolbar?.insertBefore(this.eligSelect, this.modeButton);
  }

  private createResetButton() {
    let clockResetButton = document.createElement('button');
    clockResetButton.classList.add('cesium-button', 'cesium-toolbar-button');
    clockResetButton.type = 'button';
    clockResetButton.id = 'reset-clock-btn';
    clockResetButton.addEventListener('click', () => {
      this.smartViewer.viewer.clock.currentTime =
        this.smartViewer.viewer.clock.startTime;
    });

    const clockIcon = document.createElement('img');
    clockIcon.src = '/clock-regular.svg';
    clockIcon.style.color = 'white';
    clockResetButton.appendChild(clockIcon);

    return clockResetButton;
  }

  private createConstSelect() {
    let constSelect = document.createElement('select');
    constSelect.classList.add('cesium-button', 'cesium-toolbar-button');
    constSelect.id = 'constellation-select';
    constSelect.style.display = 'none';
    constSelect.style.padding = '0 10px';
    constSelect.style.width = 'fit-content';

    constSelect.addEventListener('change', (e) => {
      const constellationsId = Object.keys(
        this.smartViewer.satellites.satellitesCollection,
      );
      const selected = (e.target as HTMLSelectElement).value;

      for (const constId of constellationsId) {
        this.smartViewer.satellites.satellitesCollection[constId].show =
          selected === SelectValues.ALL || selected === constId;
      }

      let satellites;
      const systems = store.getState().systems;

      if (systems.selectedOption?.value) {
        const constellation = systems.entities[
          systems.selectedOption?.value
        ]?.constellations.find((c) => selected === c.id.toString());
        satellites = constellation?.satellites.flatMap((els) =>
          els.map((el) => el.id.toString()),
        );
      }

      for (const entity of this.smartViewer.customPrimCollec.entities.values) {
        if (entity.id.startsWith('ELIG_')) {
          entity.polyline!.width =
            selected === SelectValues.ALL ||
            (satellites && satellites.includes(entity.id.split('_')[1]))
              ? new ConstantProperty(2)
              : new ConstantProperty(0);
        }
      }

      this.setTopoOptions();
    });

    return constSelect;
  }

  private createTopoSelect() {
    let topoSelect = document.createElement('select');
    topoSelect.classList.add('cesium-button', 'cesium-toolbar-button');
    topoSelect.id = 'topology-select';
    topoSelect.style.display = 'none';
    topoSelect.style.padding = '0 10px';
    topoSelect.style.width = 'fit-content';

    topoSelect.addEventListener('change', (e) => {
      this.onChangeTopo();
    });

    return topoSelect;
  }

  private onChangeTopo() {
    const constId = this.constSelect.selectedOptions[0].value;
    const selected = this.topoSelect.selectedOptions[0].value;
    const entities = [...this.smartViewer.customPrimCollec.entities.values];

    for (const entity of entities) {
      if (entity.id.startsWith('TOPO_')) {
        entity.show =
          (constId === SelectValues.ALL ||
            entity.id.includes(`ConstId-${constId}`)) &&
          (selected === SelectValues.ALL || entity.id.includes(selected));
      }
    }
  }

  setTopoOptions() {
    let innerHtml = '';
    const selectedConstId = this.constSelect.selectedOptions[0].value;
    const topos = Object.entries(
      this.smartViewer.topologies.topologiesCollection,
    ).filter(
      ([constId, _]) =>
        constId === selectedConstId || selectedConstId === SelectValues.ALL,
    );

    let intra = false;
    let inter = false;

    for (const topo of topos) {
      if (topo[1].intra) intra = true;
      if (topo[1].inter) inter = true;
    }

    if (intra && inter) {
      innerHtml += `<option value="${SelectValues.ALL}">All</option>`;
    }

    if (inter) {
      innerHtml += `<option value="${SelectValues.INTER}">inter</option>`;
    }

    if (intra) {
      innerHtml += `<option value="${SelectValues.INTRA}">intra</option>`;
    }
    this.topoSelect.style.display = innerHtml === '' ? 'none' : 'initial';
    innerHtml += `<option value="${SelectValues.NONE}">none</option>`;

    this.topoSelect.innerHTML = innerHtml;
    this.topoSelect.selectedIndex = 0;
    this.onChangeTopo();
  }

  private createEligSelect() {
    let eligSelect = document.createElement('select');
    eligSelect.classList.add('cesium-button', 'cesium-toolbar-button');
    eligSelect.id = 'eligibility-select';
    eligSelect.style.display = 'none';
    eligSelect.style.padding = '0 10px';
    eligSelect.style.width = 'fit-content';
    eligSelect.innerHTML = `
      <option value="${SelectValues.ALL}">Show Elig.</option>
      <option value="${SelectValues.NONE}">Hide Elig.</option>
      `;

    eligSelect.addEventListener('change', (e) => {
      for (const entity of this.smartViewer.customPrimCollec.entities.values) {
        if (entity.id.startsWith('ELIG_')) {
          entity.show =
            (e.target as HTMLSelectElement).value === SelectValues.ALL;
        }
      }
    });

    return eligSelect;
  }
}
