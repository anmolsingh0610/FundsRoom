import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '0',
    minStockAlert: '10',
    location: '',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data.data;
          setFormData({
            name: p.name || '',
            sku: p.sku || '',
            category: p.category || '',
            unitPrice: p.unitPrice.toString(),
            currentStock: p.currentStock.toString(),
            minStockAlert: p.minStockAlert.toString(),
            location: p.location || '',
          });
        } catch (error) {
          addToast('Failed to load product', 'error');
          navigate('/products');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      currentStock: parseInt(formData.currentStock),
      minStockAlert: parseInt(formData.minStockAlert),
    };

    try {
      if (isEditing) {
        await api.put(`/products/${id}`, payload);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        addToast('Product created successfully', 'success');
      }
      navigate('/products');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <Input label="SKU (Stock Keeping Unit)" name="sku" value={formData.sku} onChange={handleChange} required />
            <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
            
            <Input 
              label="Unit Price (₹)" 
              type="number" 
              step="0.01"
              name="unitPrice" 
              value={formData.unitPrice} 
              onChange={handleChange} 
              required 
            />
            
            <Input 
              label="Warehouse Location" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="e.g. Aisle 4, Shelf B"
            />

            <Input 
              label="Current Stock" 
              type="number" 
              name="currentStock" 
              value={formData.currentStock} 
              onChange={handleChange} 
              required 
              disabled={isEditing} // Usually stock is managed via movements after creation
              className={isEditing ? "opacity-50 cursor-not-allowed" : ""}
            />
            
            <Input 
              label="Min. Stock Alert Level" 
              type="number" 
              name="minStockAlert" 
              value={formData.minStockAlert} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductFormPage;
