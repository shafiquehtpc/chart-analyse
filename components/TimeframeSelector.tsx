"use client";

interface TimeframeSelectorProps {
  value: string;
  onChange: (timeframe: string) => void;
  disabled?: boolean;
}

export default function TimeframeSelector({
  value,
  onChange,
  disabled = false,
}: TimeframeSelectorProps) {
  const timeframes = [
    { label: "1 Minute", value: "1min" },
    { label: "5 Minutes", value: "5min" },
    { label: "15 Minutes", value: "15min" },
    { label: "30 Minutes", value: "30min" },
    { label: "1 Hour", value: "1h" },
    { label: "4 Hours", value: "4h" },
    { label: "Daily", value: "1day" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Timeframe</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Select a timeframe</option>
        {timeframes.map((tf) => (
          <option key={tf.value} value={tf.value}>
            {tf.label}
          </option>
        ))}
      </select>
    </div>
  );
}