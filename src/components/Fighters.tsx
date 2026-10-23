import type { CSSProperties } from 'react';
import { artwork } from '../assets';

// Original Figma sprite-sheet crops. Layers and their proportions are preserved;
// this is an editable sprite composition, not a screenshot of the game UI.
const sheet = {
  legs: artwork.spriteLegs,
  torso: artwork.spriteTorso,
  head: artwork.spriteHead,
  skin: artwork.spriteSkin,
  eyes: artwork.spriteEyes,
};
type Layer = {
  sheet: keyof typeof sheet;
  x: number;
  y: number;
  w: number;
  h: number;
  iw: string;
  ih: string;
  ix: string;
  iy: string;
};
const player: Layer[] = [
  {
    sheet: 'legs',
    x: 24.93,
    y: 89.97,
    w: 37.939,
    h: 52.031,
    iw: '5794.29%',
    ih: '3260.42%',
    ix: '-5620%',
    iy: '-2262.5%',
  },
  {
    sheet: 'torso',
    x: 16.26,
    y: 57.45,
    w: 69.374,
    h: 54.198,
    iw: '3198.44%',
    ih: '4058%',
    ix: '-2190.63%',
    iy: '-3956%',
  },
  {
    sheet: 'head',
    x: 0,
    y: 0,
    w: 84.55,
    h: 68.29,
    iw: '2625.64%',
    ih: '3220.63%',
    ix: '-511.54%',
    iy: '-760.32%',
  },
  {
    sheet: 'skin',
    x: 36.85,
    y: 23.85,
    w: 47.695,
    h: 31.435,
    iw: '4579.55%',
    ih: '7062.07%',
    ix: '-2634.09%',
    iy: '-6375.86%',
  },
  {
    sheet: 'eyes',
    x: 54.2,
    y: 31.44,
    w: 29.267,
    h: 20.595,
    iw: '7585.19%',
    ih: '10773.68%',
    ix: '-6433.33%',
    iy: '-7752.63%',
  },
];
const opponent: Layer[] = [
  {
    sheet: 'skin',
    x: 19.88,
    y: 92.77,
    w: 29.347,
    h: 49.227,
    iw: '6500%',
    ih: '3938.46%',
    ix: '-6396.77%',
    iy: '-1.92%',
  },
  {
    sheet: 'torso',
    x: 22.72,
    y: 63.43,
    w: 34.08,
    h: 51.12,
    iw: '5686.11%',
    ih: '3757.41%',
    ix: '-5533.33%',
    iy: '-2587.04%',
  },
  {
    sheet: 'skin',
    x: 0,
    y: 0,
    w: 65.32,
    h: 71.947,
    iw: '2920.29%',
    ih: '2694.74%',
    ix: '-1944.93%',
    iy: '-1988.16%',
  },
  {
    sheet: 'legs',
    x: 0,
    y: 31.24,
    w: 38.813,
    h: 28.4,
    iw: '4946.34%',
    ih: '5216.67%',
    ix: '-4129.27%',
    iy: '-4590%',
  },
  {
    sheet: 'skin',
    x: 2.84,
    y: 39.76,
    w: 21.773,
    h: 17.04,
    iw: '8760.87%',
    ih: '11377.78%',
    ix: '-5791.3%',
    iy: '-9650%',
  },
];
function Fighter({
  layers,
  width,
  className,
}: {
  layers: Layer[];
  width: number;
  className: string;
}) {
  return (
    <div className={`fighter ${className}`} style={{ width } as CSSProperties}>
      {layers.map((layer, i) => (
        <div
          className="sprite-crop"
          key={i}
          style={{ left: layer.x, top: layer.y, width: layer.w, height: layer.h }}
        >
          <img
            alt=""
            src={sheet[layer.sheet]}
            draggable="false"
            style={{ width: layer.iw, height: layer.ih, left: layer.ix, top: layer.iy }}
          />
        </div>
      ))}
    </div>
  );
}
export function Fighters() {
  return (
    <div className="arena surface" role="img" aria-label="Two Wordoken ninjas facing each other">
      <div className="fighters">
        <Fighter layers={player} width={85.634} className="player" />
        <Fighter layers={opponent} width={65.32} className="opponent" />
      </div>
    </div>
  );
}
