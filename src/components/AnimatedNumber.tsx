import CountUp from "react-countup";

export function AnimatedNumber({
  value,
  duration = 1.5,
  decimals = 0,
  prefix,
  suffix,
  separator = ",",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
}) {
  return (
    <CountUp
      end={value}
      duration={duration}
      decimals={decimals}
      separator={separator}
      prefix={prefix}
      suffix={suffix}
      preserveValue
      className={className}
    />
  );
}
