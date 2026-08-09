import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';

const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [challan, setChallan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data.data);
    } catch (error) {
      addToast('Failed to load challan', 'error');
      navigate('/challans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await api.patch(`/challans/${id}/confirm`);
      addToast('Challan confirmed successfully', 'success');
      setConfirmModal(false);
      fetchChallan();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to confirm challan', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api.patch(`/challans/${id}/cancel`);
      addToast('Challan cancelled successfully', 'success');
      setCancelModal(false);
      fetchChallan();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to cancel challan', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (!challan) return null;

  const totalAmount = challan.items.reduce((sum: number, item: any) => sum + (item.quantity * item.product.unitPrice), 0);
  const totalQty = challan.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'CONFIRMED': return 'green';
      case 'DRAFT': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/challans')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Challan #{challan.id.substring(0, 8).toUpperCase()}
              <Badge color={getStatusColor(challan.status)}>{challan.status}</Badge>
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          {challan.status === 'DRAFT' && (
            <>
              <Button variant="danger" onClick={() => setCancelModal(true)}>
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={() => setConfirmModal(true)} className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">
                <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Dispatch
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Customer Information">
          <div className="space-y-2 text-slate-300">
            <p><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-200">{challan.customer.name}</span></p>
            <p><span className="text-slate-500">Business:</span> {challan.customer.businessName || 'N/A'}</p>
            <p><span className="text-slate-500">Contact:</span> {challan.customer.mobile} | {challan.customer.email}</p>
            <p><span className="text-slate-500">Address:</span> {challan.customer.address || 'N/A'}</p>
          </div>
        </Card>
        <Card title="Challan Details">
          <div className="space-y-2 text-slate-300">
            <p><span className="text-slate-500">Date:</span> {new Date(challan.createdAt).toLocaleString()}</p>
            <p><span className="text-slate-500">Created By:</span> {challan.user?.name}</p>
            <p><span className="text-slate-500">Total Items:</span> {challan.items.length}</p>
            <p><span className="text-slate-500">Total Quantity:</span> {totalQty} units</p>
          </div>
        </Card>
      </div>

      <Card title="Line Items" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                <th className="px-6 py-4 font-medium text-right">Quantity</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {challan.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-200">{item.product.name}</td>
                  <td className="px-6 py-4 text-slate-400">{item.product.sku}</td>
                  <td className="px-6 py-4 text-right">₹{item.product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    ₹{(item.quantity * item.product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 border-t border-slate-700">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium text-slate-400">Totals:</td>
                <td className="px-6 py-4 text-right font-bold text-slate-200">{totalQty}</td>
                <td className="px-6 py-4 text-right font-bold text-lg text-emerald-400">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Challan">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to confirm this challan? This action will:
          </p>
          <ul className="list-disc pl-5 text-slate-400 space-y-1">
            <li>Deduct the specified quantities from inventory</li>
            <li>Lock the challan from further edits</li>
            <li>Mark the order as ready for dispatch</li>
          </ul>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleConfirm} isLoading={isConfirming} className="bg-emerald-600 hover:bg-emerald-500">
              Yes, Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Challan">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to cancel this challan? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setCancelModal(false)}>Back</Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Yes, Cancel It
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChallanDetailPage;
