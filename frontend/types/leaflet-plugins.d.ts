declare module 'leaflet.heat' {
  import * as L from 'leaflet';
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      minOpacity?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';
  function markerClusterGroup(options?: any): L.LayerGroup;
}
