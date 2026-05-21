import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

import { ColorFamily } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  selected: ColorFamily;
  colorsList: ColorFamily[];
  size?: number;
};

export function ColorGuideWheel({ selected, colorsList, size = 230 }: Props) {
  const center = size / 2;
  const radius = size / 2 - 14;
  const slice = (Math.PI * 2) / colorsList.length;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={center} cy={center} r={radius + 7} fill="#0B1115" stroke="rgba(214,196,139,0.28)" strokeWidth="1" />
      {colorsList.map((family, index) => {
        const start = index * slice - Math.PI / 2;
        const end = start + slice * 0.82;
        const largeArc = end - start > Math.PI ? 1 : 0;
        const x1 = center + Math.cos(start) * radius;
        const y1 = center + Math.sin(start) * radius;
        const x2 = center + Math.cos(end) * radius;
        const y2 = center + Math.sin(end) * radius;
        const inner = radius - 30;
        const ix1 = center + Math.cos(end) * inner;
        const iy1 = center + Math.sin(end) * inner;
        const ix2 = center + Math.cos(start) * inner;
        const iy2 = center + Math.sin(start) * inner;
        return (
          <Path
            key={family}
            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
            fill={colorFamilyHex[family]}
            stroke={family === selected ? colors.gold : "rgba(247,242,232,0.18)"}
            strokeWidth={family === selected ? 3 : 1}
          />
        );
      })}
      <G>
        <Circle cx={center} cy={center} r={62} fill="#050B0E" stroke="rgba(214,196,139,0.32)" strokeWidth="1" />
        <SvgText x={center} y={center - 4} fill={colors.cream} fontSize="17" fontWeight="700" textAnchor="middle">
          {selected.toUpperCase()}
        </SvgText>
        <SvgText x={center} y={center + 18} fill={colors.textMuted} fontSize="11" textAnchor="middle">
          Your Color
        </SvgText>
      </G>
    </Svg>
  );
}
