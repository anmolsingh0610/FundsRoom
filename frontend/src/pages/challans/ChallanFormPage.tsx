import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

interface LineItem {
  id: string; // temp id for UI
  productId: string;
  quantity: number;
  unitPrice: number; // for display only, we recalculate on server if needed, but showing here is good
  maxStock: number;
}

const ChallanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 1000 } }),
          api.get('/products', { params: { limit: 1000 } })
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      } catch (error) {
        addToast('Failed to load customers and products', 'error');
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, [addToast]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productId: '', quantity: 1, unitPrice: 0, maxStock: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // If product changed, update price and maxStock
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.unitPrice = product.unitPrice;
            updated.maxStock = product.currentStock;
            updated.quantity = 1; // reset quantity on product change
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent, confirm: boolean = false) => {
    e.preventDefault();
    if (!customerId) return addToast('Please select a customer', 'error');
    if (items.length === 0) return addToast('Please add at least one product', 'error');
    
    // Validate items
    const invalidItem = items.find(i => !i.productId || i.quantity <= 0);
    if (invalidItem) return addToast('Please complete all line items with valid quantities', 'error');

    setIsSubmitting(true);
    try {
      const payload = {
        customerId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };

      const res = await api.post('/challans', payload);
      const challanId = res.data.data.id;

      if (confirm) {
        try {
          await api.patch(`/challans/${challanId}/confirm`);
          addToast('Challan created and confirmed successfully', 'success');
        } catch (err: any) {
          addToast(err.response?.data?.message || 'Challan saved as draft, but failed to confirm due to stock constraints', 'error');
        }
      } else {
        addToast('Challan saved as draft', 'success');
      }
      
      navigate(`/challans/${challanId}`);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create challan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;

  const customerOptions = [
    { label: 'Select Customer...', value: '' },
    ...customers.map(c => ({ label: `${c.name} (${c.businessName || 'No Business'})`, value: c.id }))
  ];

  const productOptions = [
    { label: 'Select Product...', value: '' },
    ...products.map(p => ({ label: `${p.name} (${p.sku}) - Stock: ${p.currentStock}`, value: p.id }))
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">New Sales Challan</h1>
        <Button variant="secondary" onClick={() => navigate('/challans')}>Cancel</Button>
      </div>

      <Card title="Customer Information">
        <Select 
          label="Customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          options={customerOptions}
        />
      </Card>

      <Card title="Line Items" noPadding>
        <div className="p-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="w-full sm:flex-1">
                <Select 
                  label="Product"
                  value={item.productId}
                  onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                  options={productOptions}
                />
              </div>
              <div className="w-full sm:w-32">
                <Input 
                  label="Quantity"
                  type="number"
                  min="1"
                  max={item.maxStock || undefined}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="w-full sm:w-32 hidden md:block">
                <Input 
                  label="Unit Price (₹)"
                  value={item.unitPrice}
                  readOnly
                  className="bg-slate-900/30 text-slate-400"
                />
              </div>
              <div className="w-full sm:w-32">
                <Input 
                  label="Total (₹)"
                  value={item.quantity * item.unitPrice}
                  readOnly
                  className="bg-slate-900/30 text-slate-200 font-bold"
                />
              </div>
              <Button 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => handleRemoveItem(item.id)}
                title="Remove Item"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500">
              No products added yet. Click "Add Product" to start.
            </div>
          )}

          <Button variant="secondary" onClick={handleAddItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
        
        <div className="bg-slate-900/80 p-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl">
            <span className="text-slate-400">Total Amount: </span>
            <span className="font-bold text-slate-100">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              className="flex-1 sm:flex-none"
              onClick={(e) => handleSubmit(e, false)}
              isLoading={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button 
              className="flex-1 sm:flex-none"
              onClick={(e) => handleSubmit(e, true)}
              isLoading={isSubmitting}
            >
              Save & Confirm
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChallanFormPage;
