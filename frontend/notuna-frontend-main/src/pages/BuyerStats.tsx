import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#26A69A', '#D4AC0D'];

interface Order {
  status: string;
  date: string;
}

interface BuyerStatsData {
  totalOrders: number;
  orders: Order[];
  statusRevenue : number;
}

export default function BuyerStats() {
  const [stats, setStats] = useState<BuyerStatsData | null>(null);
  const [finStats, setFinStats] = useState<BuyerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const buyerId = localStorage.getItem("b_id");
        const res = await fetch(`https://seng2021-notuna-order.vercel.app/shop/buyer/get-buyer-stats?b_id=${buyerId}`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    async function fetchFinStats() {
      try {
        const sellerId = localStorage.getItem("s_id");
        const res = await fetch(`https://seng2021-notuna-order.vercel.app/shop/seller/get-seller-finance/${sellerId}`);
        if (!res.ok) throw new Error('Failed to fetch finance stats');
        const data = await res.json();
        setFinStats(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    fetchFinStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  const groupedData = stats?.orders?.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const chartData = Object.entries(groupedData).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="container py-4 bg-light p-4 rounded mt-5 shadow-sm">
      <h1 className="h4 mb-4 fw-bold text-dark text-center">Buyer Stats</h1>
      <div className="mb-4 fw-bold text-dark text-center">Total Orders: {stats?.totalOrders ?? 'Loading...'}</div>
      <div className="w-100 mt-3" style={{ height: '400px' }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={Object.entries(finStats?.statusRevenue ?? {}).map(([status, revenue]) => ({
        status,
        revenue: Number(revenue.toFixed(2)),
      }))}
      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" angle={-45} textAnchor="end" interval={0} height={80} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="revenue" fill="#26A69A">
        <LabelList dataKey="revenue" position="top" formatter={(val: number) => `$${val}`} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
      <div className="w-100" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#8884d8"
              label
              isAnimationActive={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h2 className="h5 mt-4">Order Timeline</h2>
      <ul className="list-unstyled">
        {stats?.orders?.map((order, idx) => (
          <li key={idx} className="border p-2 rounded mb-2 justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3">
            <div><strong>Status:</strong> {order.status}</div>
            <div><strong>Date:</strong> {order.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
