interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
}

function StatCard({ title, value, change, positive }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{value}</h2>

      {change && (
        <p
          className={`mt-2 text-sm font-medium ${
            positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}

export default StatCard;
