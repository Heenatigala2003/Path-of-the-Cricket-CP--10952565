interface DashboardCardProps {
  title: string;
  value: number;
  color?: string;
}

export default function DashboardCard({ title, value, color = 'bg-green-500' }: DashboardCardProps) {
  return (
    <div className={`p-6 rounded-xl shadow-md text-white ${color}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl mt-2">{value}</p>
    </div>
  );
}
