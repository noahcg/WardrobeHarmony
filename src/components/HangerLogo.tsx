import Svg, { Circle, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export function HangerLogo({ size = 44 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <LinearGradient id="hangerGradient" x1="10" y1="4" x2="54" y2="58">
        <Stop offset="0" stopColor="#EFE7D8" />
        <Stop offset="0.55" stopColor="#C7A24A" />
        <Stop offset="1" stopColor="#9EA56F" />
      </LinearGradient>
      <Circle cx="32" cy="32" r="29" fill="#0B1115" stroke="rgba(214,196,139,0.42)" strokeWidth="1.5" />
      <Path
        d="M31.7 17.7c0-4.7 7.2-5.1 7.2-.4 0 4.2-5.2 4.1-5.2 8.1v2.2"
        fill="none"
        stroke="url(#hangerGradient)"
        strokeLinecap="round"
        strokeWidth="3.4"
      />
      <Path
        d="M15.5 45.6 32 31.4l16.5 14.2c1.6 1.4.6 4-1.5 4H17c-2.1 0-3.1-2.6-1.5-4Z"
        fill="none"
        stroke="url(#hangerGradient)"
        strokeLinejoin="round"
        strokeWidth="3.4"
      />
    </Svg>
  );
}
