import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Eye, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, category, lowStock, page]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products', {
        params: { page, limit: 10, search, category, lowStock: lowStock ? 'true' : '' }
      });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Products</h1>
        <Button onClick={() => navigate('/products/new')}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-800/60 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products by name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              options={[
                { label: 'All Categories', value: '' },
                { label: 'Electronics', value: 'Electronics' },
                { label: 'Apparel', value: 'Apparel' },
                { label: 'Home', value: 'Home' },
                { label: 'Industrial', value: 'Industrial' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="checkbox" 
              id="lowStock"
              checked={lowStock}
              onChange={(e) => setLowStock(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="lowStock" className="text-sm text-slate-300 whitespace-nowrap cursor-pointer">
              Low Stock Only
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name & SKU</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Unit Price</th>
                  <th className="px-6 py-4 font-medium">Stock Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.length > 0 ? (
                  products.map((product) => {
                    const isLowStock = product.currentStock <= product.minStockAlert;
                    return (
                      <tr key={product.id} className={`hover:bg-slate-800/30 transition-colors ${isLowStock ? 'bg-red-500/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-200">{product.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{product.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color="gray">{product.category}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                              {product.currentStock} units
                            </span>
                            {isLowStock && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${product.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${product.id}/edit`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No products found.
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

export default ProductListPage;
