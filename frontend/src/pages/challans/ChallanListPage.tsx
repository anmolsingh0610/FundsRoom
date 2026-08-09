import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

const ChallanListPage: React.FC = () => {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchChallans();
  }, [status, page]);

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/challans', {
        params: { page, limit: 10, status }
      });
      setChallans(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'CONFIRMED': return 'green';
      case 'DRAFT': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Sales Challans</h1>
        <Button onClick={() => navigate('/challans/new')}>
          <Plus className="w-4 h-4 mr-2" /> New Challan
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-800/60 flex justify-end">
          <div className="w-full md:w-48">
            <Select 
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Confirmed', value: 'CONFIRMED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Challan #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total Items/Qty</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created By</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {challans.length > 0 ? (
                  challans.map((challan) => {
                    const totalQty = challan.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                    return (
                      <tr key={challan.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">
                          #{challan.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">{challan.customer?.name || 'Unknown Customer'}</td>
                        <td className="px-6 py-4">
                          {challan.items?.length || 0} items ({totalQty} qty)
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={getStatusColor(challan.status)}>
                            {challan.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{challan.user?.name || '-'}</td>
                        <td className="px-6 py-4">{new Date(challan.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/challans/${challan.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No sales challans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </Card>
    </div>
  );
};

export default ChallanListPage;
