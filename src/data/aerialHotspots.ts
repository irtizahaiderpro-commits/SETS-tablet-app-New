export type AerialHotspotStatus =
  | "available"
  | "booked"
  | "occupied"
  | "steam"
  | "ready"
  | "issue";

export type AerialHotspot = {
  id: string;
  plot: "A" | "B" | "C" | "D" | "E" | "F";
  bay: number;
  status: AerialHotspotStatus;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

type HotspotGrid = {
  left: number;
  top: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
  gapX: number;
  gapY: number;
};

const statusCycle: AerialHotspotStatus[] = [
  "booked",
  "occupied",
  "steam",
  "occupied",
  "ready",
  "booked",
  "occupied",
  "issue",
];

function slug(plot: AerialHotspot["plot"], bay: number) {
  return `plot-${plot.toLowerCase()}-bay-${bay}`;
}

function createPlotHotspots(
  plot: AerialHotspot["plot"],
  booked: number,
  available: number,
  grid: HotspotGrid,
): AerialHotspot[] {
  const statuses = [
    ...Array.from({ length: booked }, (_, index) => statusCycle[index % statusCycle.length]),
    ...Array.from({ length: available }, () => "available" as AerialHotspotStatus),
  ];
  return statuses.map((status, index) => {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    const bay = index + 1;
    return {
      id: slug(plot, bay),
      plot,
      bay,
      status,
      xPercent: grid.left + column * (grid.cellWidth + grid.gapX),
      yPercent: grid.top + row * (grid.cellHeight + grid.gapY),
      widthPercent: grid.cellWidth,
      heightPercent: grid.cellHeight,
    };
  });
}

export const defaultAerialHotspots: AerialHotspot[] = [
  ...createPlotHotspots("A", 6, 2, {
    left: 5.9,
    top: 74.8,
    columns: 2,
    cellWidth: 2.8,
    cellHeight: 2.05,
    gapX: 0.9,
    gapY: 1.0,
  }),
  ...createPlotHotspots("B", 12, 4, {
    left: 15.35,
    top: 70.35,
    columns: 4,
    cellWidth: 2.15,
    cellHeight: 3.2,
    gapX: 0.85,
    gapY: 0.9,
  }),
  ...createPlotHotspots("C", 7, 2, {
    left: 15.3,
    top: 57.45,
    columns: 3,
    cellWidth: 1.55,
    cellHeight: 2.65,
    gapX: 0.7,
    gapY: 0.9,
  }),
  ...createPlotHotspots("D", 11, 4, {
    left: 34.7,
    top: 42.75,
    columns: 6,
    cellWidth: 4.2,
    cellHeight: 2.05,
    gapX: 0.55,
    gapY: 1.0,
  }),
  ...createPlotHotspots("E", 9, 5, {
    left: 63.25,
    top: 9.45,
    columns: 2,
    cellWidth: 1.35,
    cellHeight: 3.05,
    gapX: 0.9,
    gapY: 1.0,
  }),
  ...createPlotHotspots("F", 24, 11, {
    left: 24.0,
    top: 86.65,
    columns: 9,
    cellWidth: 3.45,
    cellHeight: 1.8,
    gapX: 0.65,
    gapY: 0.75,
  }),
];
