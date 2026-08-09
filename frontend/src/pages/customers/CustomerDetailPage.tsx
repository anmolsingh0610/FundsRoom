import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (error) {
      addToast('Failed to load customer', 'error');
      navigate('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    setIsSubmittingNote(true);
    try {
      await api.post(`/customers/${id}/follow-ups`, { note });
      addToast('Note added successfully', 'success');
      setNote('');
      fetchCustomer(); // Refresh data to get new note
    } catch (error) {
      addToast('Failed to add note', 'error');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (!customer) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-100">{customer.name}</h1>
        </div>
        <Button onClick={() => navigate(`/customers/${customer.id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Customer Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Business Name</p>
                <p className="font-medium text-slate-200">{customer.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Contact</p>
                <p className="font-medium text-slate-200">{customer.mobile}</p>
                <p className="text-sm text-slate-400">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Status & Type</p>
                <div className="flex gap-2 mt-1">
                  <Badge color="blue">{customer.customerType}</Badge>
                  <Badge color={customer.status === 'ACTIVE' ? 'green' : customer.status === 'LEAD' ? 'yellow' : 'red'}>
                    {customer.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">GST Number</p>
                <p className="font-medium text-slate-200">{customer.gstNumber || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Address</p>
                <p className="text-slate-300">{customer.address || 'No address provided'}</p>
              </div>
            </div>
          </Card>

          <Card title="Notes">
            <p className="text-slate-300 whitespace-pre-wrap">{customer.notes || 'No general notes.'}</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Follow-ups & Activity" className="h-full flex flex-col">
            <form onSubmit={handleAddNote} className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Add Note</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-input min-h-[80px] mb-2 text-sm"
                placeholder="Log a call, meeting, or reminder..."
              />
              <Button type="submit" size="sm" className="w-full" isLoading={isSubmittingNote} disabled={!note.trim()}>
                <MessageSquare className="w-4 h-4 mr-2" /> Add Note
              </Button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {customer.followUps && customer.followUps.length > 0 ? (
                customer.followUps.map((f: any) => (
                  <div key={f.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                    <p className="text-sm text-slate-300 mb-2">{f.note}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{f.user?.name || 'Unknown User'}</span>
                      <span>{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No follow-ups recorded yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
