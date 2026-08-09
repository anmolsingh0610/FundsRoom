import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, type, page]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { page, limit: 10, search, status, type }
      });
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'RETAIL': return 'gray';
      case 'WHOLESALE': return 'blue';
      case 'DISTRIBUTOR': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'green';
      case 'LEAD': return 'yellow';
      case 'INACTIVE': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Customers</h1>
        <Button onClick={() => navigate('/customers/new')}>
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-800/60 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Lead', value: 'LEAD' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              options={[
                { label: 'All Types', value: '' },
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Distributor', value: 'DISTRIBUTOR' },
              ]}
              value={type}
              onChange={(e) => setType(e.target.value)}
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
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Business</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Type & Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{customer.name}</td>
                      <td className="px-6 py-4">{customer.businessName || '-'}</td>
                      <td className="px-6 py-4">
                        <div>{customer.mobile}</div>
                        <div className="text-xs text-slate-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <Badge color={getTypeColor(customer.customerType)} className="mr-2">
                          {customer.customerType}
                        </Badge>
                        <Badge color={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No customers found matching your criteria.
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

export default CustomerListPage;
