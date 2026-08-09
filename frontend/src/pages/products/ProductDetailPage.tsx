import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [movementForm, setMovementForm] = useState({
    quantityChanged: '',
    movementType: 'IN',
    reason: ''
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (error) {
      addToast('Failed to load product', 'error');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/products/${id}/stock-movements`, {
        quantityChanged: parseInt(movementForm.quantityChanged),
        movementType: movementForm.movementType,
        reason: movementForm.reason
      });
      addToast('Stock movement recorded', 'success');
      setIsModalOpen(false);
      setMovementForm({ quantityChanged: '', movementType: 'IN', reason: '' });
      fetchProduct();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to record movement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (!product) return null;

  const isLowStock = product.currentStock <= product.minStockAlert;
  const stockPercentage = Math.min(100, Math.max(0, (product.currentStock / (product.minStockAlert * 3)) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-100">{product.name}</h1>
        </div>
        <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Product Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">SKU</p>
                <p className="font-mono font-medium text-slate-200">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <Badge color="gray" className="mt-1">{product.category}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Unit Price</p>
                <p className="font-medium text-slate-200 text-lg">
                  ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Warehouse Location</p>
                <p className="text-slate-300">{product.location || 'Not assigned'}</p>
              </div>
            </div>
          </Card>

          <Card title="Stock Status">
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-400">Current Stock</span>
                <span className={`text-3xl font-bold ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                  {product.currentStock}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">
                Alert level: {product.minStockAlert} units
              </p>
            </div>
            <Button className="w-full" onClick={() => setIsModalOpen(true)}>
              Record Stock Movement
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Stock Movement History" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Quantity</th>
                    <th className="px-6 py-3 font-medium">Reason</th>
                    <th className="px-6 py-3 font-medium">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {product.stockMovements && product.stockMovements.length > 0 ? (
                    product.stockMovements.map((m: any) => (
                      <tr key={m.id}>
                        <td className="px-6 py-4">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge color={m.movementType === 'IN' ? 'green' : 'red'} className="flex w-fit items-center gap-1">
                            {m.movementType === 'IN' ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                            {m.movementType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium">{m.quantityChanged}</td>
                        <td className="px-6 py-4">{m.reason || '-'}</td>
                        <td className="px-6 py-4 text-slate-400">{m.user?.name || 'System'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No stock movements recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Stock Movement">
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <Select
            label="Movement Type"
            value={movementForm.movementType}
            onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value })}
            options={[
              { label: 'Stock In (+)', value: 'IN' },
              { label: 'Stock Out (-)', value: 'OUT' }
            ]}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={movementForm.quantityChanged}
            onChange={(e) => setMovementForm({ ...movementForm, quantityChanged: e.target.value })}
            required
          />
          <Input
            label="Reason / Reference"
            value={movementForm.reason}
            onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
            placeholder="e.g. Supplier delivery, Damage, Manual adjustment"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Movement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
