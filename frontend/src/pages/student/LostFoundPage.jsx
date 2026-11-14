import React, { useState, useEffect } from 'react';
import { itemsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  FileQuestion,
  Tag
} from 'lucide-react';

const LostFoundPage = () => {
  const [activeTab, setActiveTab] = useState('found'); // 'found' or 'lost' or 'claims'
  const [items, setItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim Modal State
  const [claimingItem, setClaimingItem] = useState(null);
  const [claimReason, setClaimReason] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const { success, error: toastError } = useToast();
  const { refreshNotifications } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        itemsService.getItems(),
        itemsService.getMyClaims()
      ]);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.items || []);
      }
      if (claimsRes.data.success) {
        setMyClaims(claimsRes.data.claims || []);
      }
    } catch (err) {
      console.error('Error fetching lost & found:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenClaimModal = (item) => {
    setClaimingItem(item);
    setClaimReason('');
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimingItem) return;

    setClaimSubmitting(true);
    try {
      const res = await itemsService.claimItem(claimingItem.id, claimReason);
      if (res.data.success) {
        success('Claim submitted! Faculty has been notified for verification.');
        setClaimingItem(null);
        refreshNotifications();
        await loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit claim.';
      toastError(msg);
    } finally {
      setClaimSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => item.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Search className="w-6 h-6 text-blue-600" />
            Digital Lost &amp; Found
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Search items discovered on campus or submit verification to claim your belongings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'found'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found Items ({items.filter((i) => i.type === 'found').length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'lost'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost Items ({items.filter((i) => i.type === 'lost').length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'claims'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Claims ({myClaims.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading items...</p>
        </div>
      ) : activeTab === 'claims' ? (
        /* My Claims Tab View */
        myClaims.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No Claims Submitted"
            description="You have not submitted a claim for any lost items yet. Browse the Found Items tab to find your belongings."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Claim #{claim.id} &bull; {claim.item_type?.toUpperCase()} ITEM
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">{claim.item_name}</h3>
                  </div>
                  <Badge status={claim.status} />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-1">Your Claim Details:</span>
                  <p className="leading-relaxed">{claim.claim_reason}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                  {claim.status === 'Handed Over' && claim.handed_over_at && (
                    <span className="text-purple-600 font-medium">
                      Handed Over on: {new Date(claim.handed_over_at).toLocaleDateString()}
                    </span>
                  )}
                  {claim.status === 'Approved' && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for collection at HOD room
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Lost & Found Cards Grid */
        filteredItems.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No ${activeTab === 'found' ? 'Found' : 'Lost'} Items Reported`}
            description={`There are currently no items listed in the ${activeTab} section.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const hasClaimed = !!item.myClaim;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Image */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {item.image_path ? (
                      <img
                        src={item.image_path}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                        <Tag className="w-10 h-10 stroke-[1.5] mb-1" />
                        <span className="text-xs font-medium">No photo provided</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
                        {item.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge status={item.status} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.place}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Date: {item.date}</span>
                      </div>
                    </div>

                    {/* Action: "This is Mine" button */}
                    <div className="pt-2">
                      {hasClaimed ? (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-800">Your Claim:</span>
                          <Badge status={item.myClaim.status} />
                        </div>
                      ) : item.status === 'Handed Over' ? (
                        <div className="text-center py-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl">
                          Item Officially Handed Over
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenClaimModal(item)}
                          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>This is Mine (Claim Item)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Claim Modal */}
      <Modal
        isOpen={!!claimingItem}
        onClose={() => setClaimingItem(null)}
        title={`Claim Item: ${claimingItem?.name}`}
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 border border-blue-100 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <p>
              Please provide identifying proof or details (e.g. unique scratches, serial number, stickers, exact contents) so faculty can verify ownership.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Identifying Proof &amp; Description
            </label>
            <textarea
              required
              rows={4}
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="e.g. This is my Casio scientific calculator. It has a blue sticker with initials 'RV' on the battery cover and was left in Seminar Hall 2."
              className="block w-full p-3 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setClaimingItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={claimSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {claimSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Claim...</span>
                </>
              ) : (
                <span>Submit Claim to Faculty</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LostFoundPage;
