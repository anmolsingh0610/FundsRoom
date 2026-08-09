import React, { useEffect, useState } from 'react';
import { Users, Package, AlertTriangle, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  recentChallans: any[];
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner size="xl" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user?.name}</h1>
          <p className="text-slate-400">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-2" /> Product
          </Button>
          <Button onClick={() => navigate('/challans/new')}>
            <Plus className="w-4 h-4 mr-2" /> Challan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Customers</p>
              <h3 className="text-2xl font-bold text-slate-100">{stats?.totalCustomers || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Products</p>
              <h3 className="text-2xl font-bold text-slate-100">{stats?.totalProducts || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-slate-100">{stats?.lowStockProducts || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Challans</p>
              <h3 className="text-2xl font-bold text-slate-100">{stats?.totalChallans || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Sales Challans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Challan #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recentChallans?.length ? (
                stats.recentChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">#{challan.id.substring(0, 8)}</td>
                    <td className="px-4 py-3">{challan.customer?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <Badge color={challan.status === 'CONFIRMED' ? 'green' : challan.status === 'DRAFT' ? 'yellow' : 'red'}>
                        {challan.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{new Date(challan.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/challans/${challan.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No recent challans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
