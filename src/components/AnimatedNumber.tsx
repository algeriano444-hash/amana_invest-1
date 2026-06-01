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
  // Fix for SSR environments where react-countup might be imported as an object with a default property
  const CountUpComponent = (CountUp as any).default || CountUp;

  return (
    <CountUpComponent
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

