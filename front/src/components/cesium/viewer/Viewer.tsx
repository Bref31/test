import { useEffect, useRef } from 'react';
import { useAppSelector } from 'store';
import {
  groundSegmentsSelectors,
  systemsSelectors,
  topologiesSelectors,
} from 'store/slices';
import SmartViewer from './SmartViewer';

function CesiumViewer() {
  const viewerRef = useRef(null);
  const viewer = useRef<SmartViewer>();

  const groundSegment = useAppSelector(groundSegmentsSelectors.selectCurrent);
  const ephemeris = useAppSelector((state) => state.ephemeris.data);
  const system = useAppSelector(systemsSelectors.selectCurrent);
  const topologies = useAppSelector(topologiesSelectors.selectAllCurrent);
  const eligibilites = useAppSelector((state) => state.eligibilities.data);

  useEffect(() => {
    if (viewerRef.current) {
      viewer.current = new SmartViewer(viewerRef.current);
    }

    return () => {
      if (viewer.current) {
        viewer.current.cleanup();
        delete viewer.current;
      }
    };
  }, [viewerRef]);

  useEffect(() => {
    if (groundSegment) {
      viewer.current?.setStations(groundSegment.stations);
    } else {
      viewer.current?.removeStation();
    }
  }, [groundSegment]);

  useEffect(() => {
    if (ephemeris && system) {
      viewer.current?.setSatellites(system, ephemeris);

      if (topologies) viewer.current?.setTopologies(topologies);
    } else {
      viewer.current?.removeSatellites();
    }
    // eslint-disable-next-line
  }, [ephemeris]);

  useEffect(() => {
    if (!ephemeris) return;

    viewer.current?.setTopologies(topologies);
  }, [topologies]);

  useEffect(() => {
    if (eligibilites) {
      viewer.current?.setEligibilities(eligibilites);
    } else {
      viewer.current?.removeEligibility();
    }
  }, [eligibilites]);

  return (
    <>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
    </>
  );
}

export default CesiumViewer;
