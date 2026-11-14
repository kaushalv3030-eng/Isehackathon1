import React, { useState, useEffect } from 'react';
import { itemsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Calendar,
  MapPin,
  Loader2,
  Tag
} from 'lucide-react';

const LostFoundMgmtPage = () => {
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' or 'items'
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    place: '',
    date: new Date().toISOString().split('T')[0],
    type: 'found',
    status: 'Open'
  });
  const [itemImageFile, setItemImageFile] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(false);

  // Delete Confirmation Modal
  const [deletingItemId, setDeletingItemId] = useState(null);

  const { success, error: toastError } = useToast();
  const { refreshNotifications } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        itemsService.getItems(),
        itemsService.getAllClaims()
      ]);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.items || []);
      }
      if (claimsRes.data.success) {
        setClaims(claimsRes.data.claims || []);
      }
    } catch (err) {
      console.error('Error loading lost & found mgmt:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      description: '',
      place: '',
      date: new Date().toISOString().split('T')[0],
      type: 'found',
      status: 'Open'
    });
    setItemImageFile(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      place: item.place,
      date: item.date,
      type: item.type,
      status: item.status
    });
    setItemImageFile(null);
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setSubmittingItem(true);

    try {
      const formData = new FormData();
      formData.append('name', itemFormData.name);
      formData.append('description', itemFormData.description);
      formData.append('place', itemFormData.place);
      formData.append('date', itemFormData.date);
      formData.append('type', itemFormData.type);
      formData.append('status', itemFormData.status);
      if (itemImageFile) {
        formData.append('image', itemImageFile);
      }

      if (editingItem) {
        await itemsService.updateItem(editingItem.id, formData);
        success('Item updated successfully');
      } else {
        await itemsService.createItem(formData);
        success('New item posted');
      }

      setIsItemModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save item';
      toastError(msg);
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    try {
      await itemsService.deleteItem(deletingItemId);
      success('Item deleted successfully');
      setDeletingItemId(null);
      await loadData();
    } catch (err) {
      toastError('Failed to delete item');
    }
  };

  const handleUpdateClaimStatus = async (claimId, newStatus) => {
    try {
      const res = await itemsService.updateClaimStatus(claimId, newStatus);
      if (res.data.success) {
        success(`Claim status updated to "${newStatus}"`);
        refreshNotifications();
        await loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update claim';
      toastError(msg);
    }
  };

  const pendingClaimsCount = claims.filter((c) => c.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Search className="w-6 h-6 text-sky-500" />
            Lost &amp; Found Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage cataloged items and verify student claims
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-cream-200 dark:bg-dark-800 rounded-xl w-fit border border-cream-300/60 dark:border-dark-700">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'claims'
              ? 'bg-white dark:bg-dark-900 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Claims</span>
          {pendingClaimsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {pendingClaimsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'items'
              ? 'bg-white dark:bg-dark-900 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cataloged Items ({items.length})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading records...</p>
        </div>
      ) : activeTab === 'claims' ? (
        /* Claims Review View */
        claims.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Claims Received"
            description="There are currently no claims submitted for review."
          />
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        #{claim.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                        {claim.item_type}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        &bull; {new Date(claim.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                      {claim.item_name}
                    </h3>
                  </div>
                  <Badge status={claim.status} />
                </div>

                {/* Student Details & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white dark:bg-dark-900 border border-cream-200 dark:border-dark-700 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Student
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{claim.student_name}</p>
                    <p className="text-slate-500 font-mono mt-0.5">
                      {claim.student_roll || 'N/A'} &bull; {claim.student_class}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Proof / Description
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{claim.claim_reason}"
                    </p>
                  </div>
                </div>

                {/* Actions & Handover Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cream-200 dark:border-dark-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {claim.handed_over_at ? (
                      <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4" />
                        <span>
                          Handed over to {claim.student_name} on {new Date(claim.handed_over_at).toLocaleDateString()}
                        </span>
                      </span>
                    ) : (
                      <span>Location: {claim.place}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {claim.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'Approved')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'Rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {claim.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateClaimStatus(claim.id, 'Handed Over')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Mark Handed Over</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Items Catalog Grid */
        items.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No Items Cataloged"
            description="Click 'Add Item' above to post a lost or found item."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="h-40 bg-cream-200/50 dark:bg-dark-900 relative overflow-hidden flex items-center justify-center border-b border-cream-200 dark:border-dark-700">
                  {item.image_path ? (
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Tag className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/70 text-white">
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <Badge status={item.status} />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{item.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-cream-200 dark:border-dark-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.place}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-cream-200 dark:border-dark-600 hover:bg-cream-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingItemId(item.id)}
                      className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add Item'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={itemFormData.type}
                onChange={(e) => setItemFormData({ ...itemFormData, type: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              >
                <option value="found">Found Item</option>
                <option value="lost">Lost Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={itemFormData.status}
                onChange={(e) => setItemFormData({ ...itemFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              >
                <option value="Open">Open</option>
                <option value="Claim Pending">Claim Pending</option>
                <option value="Claimed">Claimed</option>
                <option value="Handed Over">Handed Over</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              required
              value={itemFormData.name}
              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
              placeholder="e.g. Scientific Calculator"
              className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={itemFormData.description}
              onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
              placeholder="Color, brand, distinguishing marks..."
              className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Place
              </label>
              <input
                type="text"
                required
                value={itemFormData.place}
                onChange={(e) => setItemFormData({ ...itemFormData, place: e.target.value })}
                placeholder="e.g. Lab 2"
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={itemFormData.date}
                onChange={(e) => setItemFormData({ ...itemFormData, date: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setItemImageFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-600 dark:file:bg-sky-950/40 dark:file:text-sky-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-cream-200 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingItem}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-sm disabled:opacity-60 flex items-center gap-1.5"
            >
              {submittingItem ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? 'Save Changes' : 'Publish Item'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this item? Associated claims will also be removed.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeletingItemId(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-cream-200 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteItem}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LostFoundMgmtPage;
