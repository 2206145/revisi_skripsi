export default function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-5 text-white ${color} flex items-center gap-4 shadow`}>
      <div className="bg-white/20 rounded-lg p-3">{icon}</div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
