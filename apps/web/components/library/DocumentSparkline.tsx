interface DocumentSparklineProps {
  values: number[];
}

export function DocumentSparkline({ values }: DocumentSparklineProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[1.5px] h-[18px]">
      {values.map((v, i) => {
        const h = Math.max(2, Math.round((v / max) * 18));
        return (
          <span
            key={i}
            className="block w-[3px] bg-text-mid rounded-[0.5px]"
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
