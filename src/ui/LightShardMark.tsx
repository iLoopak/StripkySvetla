interface LightShardMarkProps {
  className?: string;
}

export function LightShardMark({ className = "" }: LightShardMarkProps) {
  return (
    <span
      className={`light-shard-mark${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </span>
  );
}
