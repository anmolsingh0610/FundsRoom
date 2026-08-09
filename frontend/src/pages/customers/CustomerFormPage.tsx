import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';

const CustomerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    status: 'LEAD',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customers/${id}`);
          const c = res.data.data;
          setFormData({
            name: c.name || '',
            email: c.email || '',
            mobile: c.mobile || '',
            businessName: c.businessName || '',
            gstNumber: c.gstNumber || '',
            customerType: c.customerType || 'RETAIL',
            status: c.status || 'LEAD',
            address: c.address || '',
            notes: c.notes || '',
          });
        } catch (error) {
          addToast('Failed to load customer', 'error');
          navigate('/customers');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEditing, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/customers/${id}`, formData);
        addToast('Customer updated successfully', 'success');
      } else {
        await api.post('/customers', formData);
        addToast('Customer created successfully', 'success');
      }
      navigate('/customers');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">
          {isEditing ? 'Edit Customer' : 'Add Customer'}
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} />
            
            <Select 
              label="Customer Type" 
              name="customerType" 
              value={formData.customerType} 
              onChange={handleChange}
              options={[
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Distributor', value: 'DISTRIBUTOR' },
              ]}
            />
            
            <Select 
              label="Status" 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              options={[
                { label: 'Lead', value: 'LEAD' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
            
            <div className="md:col-span-2">
              <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input min-h-[100px]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-input min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerFormPage;
