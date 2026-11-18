import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  Download,
  RefreshCw,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Bed,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
} from 'lucide-react';
import {
  AdminDataResponse,
  OrderItem,
  PackageItem,
  PublicSettings,
  RoomItem,
} from '../types/site';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onDataUpdated: () => void;
}

type AdminTab = 'overview' | 'orders' | 'rooms' | 'gallery' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onDataUpdated,
}) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('bgh_admin_token') || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminData, setAdminData] = useState<AdminDataResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Gallery upload form
  const [galTitle, setGalTitle] = useState('');
  const [galTitleBn, setGalTitleBn] = useState('');
  const [galCategory, setGalCategory] = useState<'rooms' | 'interior' | 'exterior' | 'facilities'>('rooms');
  const [galCaption, setGalCaption] = useState('');
  const [galCaptionBn, setGalCaptionBn] = useState('');
  const [galSpecs, setGalSpecs] = useState('');
  const [galDataUrl, setGalDataUrl] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [uploadingGal, setUploadingGal] = useState(false);

  // Editable settings draft
  const [settingsDraft, setSettingsDraft] = useState<PublicSettings | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAdminData = useCallback(async (authToken: string) => {
    if (!authToken) return;
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('bgh_admin_token');
        setToken('');
        setAdminData(null);
        return;
      }
      const data: AdminDataResponse = await res.json();
      setAdminData(data);
      setSettingsDraft(data.settings);
    } catch {
      showToast('err', 'Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token, fetchAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
      } else {
        localStorage.setItem('bgh_admin_token', data.token);
        setToken(data.token);
        setPassword('');
      }
    } catch {
      setLoginError('Server connection failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
    localStorage.removeItem('bgh_admin_token');
    setToken('');
    setAdminData(null);
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showToast('err', 'Excel export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bandhan-database.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('ok', 'Excel database downloaded');
    } catch {
      showToast('err', 'Unable to download Excel database');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderItem['status']) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast('err', d.error || 'Failed to update status');
        return;
      }
      await fetchAdminData(token);
      showToast('ok', `Order ${orderId} updated to ${status}`);
    } catch {
      showToast('err', 'Network error updating order');
    }
  };

  const handleSaveRoom = async (room: RoomItem) => {
    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(room),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('err', d.error || 'Failed to update room');
        return;
      }
      await fetchAdminData(token);
      onDataUpdated();
      showToast('ok', `${room.name} saved`);
    } catch {
      showToast('err', 'Error saving room');
    }
  };

  const handleUploadRoomImage = async (room: RoomItem, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataUrl: reader.result }),
        });
        const d = await res.json();
        if (!res.ok) {
          showToast('err', d.error || 'Upload failed');
          return;
        }
        await handleSaveRoom({ ...room, image: d.path });
      } catch {
        showToast('err', 'Image upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePackage = async (pkg: PackageItem) => {
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pkg),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('err', d.error || 'Failed to update package');
        return;
      }
      await fetchAdminData(token);
      onDataUpdated();
      showToast('ok', `${pkg.name} saved`);
    } catch {
      showToast('err', 'Error saving package');
    }
  };

  const handleSelectGalleryFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setGalDataUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galDataUrl && !galImageUrl) {
      showToast('err', 'Select an image file or provide an image path');
      return;
    }
    setUploadingGal(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: galTitle,
          titleBn: galTitleBn || galTitle,
          category: galCategory,
          caption: galCaption,
          captionBn: galCaptionBn || galCaption,
          specs: galSpecs,
          dataUrl: galDataUrl || undefined,
          image: galImageUrl || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('err', d.error || 'Failed to add photo');
      } else {
        setGalTitle('');
        setGalTitleBn('');
        setGalCaption('');
        setGalCaptionBn('');
        setGalSpecs('');
        setGalDataUrl('');
        setGalImageUrl('');
        await fetchAdminData(token);
        onDataUpdated();
        showToast('ok', 'Photo added to live gallery');
      }
    } catch {
      showToast('err', 'Error uploading gallery photo');
    } finally {
      setUploadingGal(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showToast('err', 'Failed to delete photo');
        return;
      }
      await fetchAdminData(token);
      onDataUpdated();
      showToast('ok', 'Photo deleted');
    } catch {
      showToast('err', 'Network error deleting photo');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsDraft),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('err', d.error || 'Failed to save settings');
        return;
      }
      await fetchAdminData(token);
      onDataUpdated();
      showToast('ok', 'Website settings updated live');
    } catch {
      showToast('err', 'Error saving settings');
    }
  };

  const handleUploadHeroImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataUrl: reader.result }),
        });
        const d = await res.json();
        if (res.ok && settingsDraft) {
          setSettingsDraft({ ...settingsDraft, heroImage: d.path });
          showToast('ok', 'Hero image uploaded — click Save Settings to apply');
        }
      } catch {
        showToast('err', 'Upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('err', d.error || 'Password update failed');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      showToast('ok', 'Password changed. Please sign in again.');
      localStorage.removeItem('bgh_admin_token');
      setToken('');
    } catch {
      showToast('err', 'Error updating password');
    }
  };

  // Login Gate
  if (!token) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-serif-luxury text-xl font-bold text-white">
                  Bandhan Admin Portal
                </h1>
                <p className="text-xs text-stone-400">Manage bookings, tariffs & gallery</p>
              </div>
            </div>
            <button
              onClick={onBackToSite}
              className="text-xs text-stone-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Site</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-stone-950 border border-stone-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer"
            >
              {loggingIn ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-[11px] text-stone-500 text-center">
            Default credentials: <span className="font-mono text-stone-300">admin</span> /{' '}
            <span className="font-mono text-stone-300">bandhan123</span> (update anytime in Settings)
          </p>
        </div>
      </div>
    );
  }

  const orders = adminData?.orders || [];
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.guestName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300 hover:text-amber-400 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Live Site</span>
            </button>
            <span className="text-stone-700">|</span>
            <h1 className="font-serif-luxury text-lg font-bold text-white whitespace-nowrap">
              Bandhan Admin
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => fetchAdminData(token)}
              className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-lg cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-stone-800/80 py-2">
          {[
            { key: 'overview' as const, label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { key: 'orders' as const, label: `Bookings (${orders.length})`, icon: <ClipboardList className="w-3.5 h-3.5" /> },
            { key: 'rooms' as const, label: 'Rooms & Packages', icon: <Bed className="w-3.5 h-3.5" /> },
            { key: 'gallery' as const, label: `Gallery (${adminData?.gallery.length || 0})`, icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { key: 'settings' as const, label: 'Settings & Password', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-semibold bg-stone-900 border-stone-700 text-white">
          {toast.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && adminData && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Bookings', val: adminData.stats.totalOrders },
                { label: 'Pending', val: adminData.stats.pending },
                { label: 'Confirmed', val: adminData.stats.confirmed },
                { label: 'Checked-in', val: adminData.stats.checkedIn },
                { label: 'Completed', val: adminData.stats.completed },
                { label: 'Revenue (BDT)', val: `৳${adminData.stats.revenue.toLocaleString('en-US')}` },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-stone-900 border border-stone-800 rounded-xl p-4"
                >
                  <span className="text-xs text-stone-400 block">{kpi.label}</span>
                  <span className="text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                    {kpi.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Recent Reservations</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  View all bookings →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="py-2.5 pr-4">Booking ID</th>
                      <th className="py-2.5 pr-4">Guest</th>
                      <th className="py-2.5 pr-4">Room / Package</th>
                      <th className="py-2.5 pr-4">Dates</th>
                      <th className="py-2.5 pr-4">Total</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/70">
                    {adminData.stats.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 pr-4 font-mono text-amber-400 font-semibold">{o.id}</td>
                        <td className="py-3 pr-4">
                          <span className="font-medium text-white block">{o.guestName}</span>
                          <span className="text-stone-400 font-mono">{o.phone}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-stone-200 block">{o.roomName}</span>
                          <span className="text-stone-500">{o.packageName}</span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-stone-300">
                          {o.checkIn || '-'} → {o.checkOut || '-'} ({o.nights}n)
                        </td>
                        <td className="py-3 pr-4 font-mono tabular-nums font-bold text-white">
                          ৳{o.total.toLocaleString('en-US')}
                        </td>
                        <td className="py-3">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleOrderStatusChange(o.id, e.target.value as OrderItem['status'])
                            }
                            className="bg-stone-950 border border-stone-700 text-stone-200 rounded-md px-2 py-1 text-xs cursor-pointer"
                          >
                            {['Pending', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'].map(
                              (s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && adminData && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">All Bookings ({filteredOrders.length})</h2>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search ID, name or phone..."
                  className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200"
                >
                  <option value="all">All Statuses</option>
                  {['Pending', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th className="py-2.5 pr-4">ID</th>
                    <th className="py-2.5 pr-4">Guest & Phone</th>
                    <th className="py-2.5 pr-4">Room & Package</th>
                    <th className="py-2.5 pr-4">Dates & Guests</th>
                    <th className="py-2.5 pr-4">Notes</th>
                    <th className="py-2.5 pr-4">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/70">
                  {filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-4 font-mono font-bold text-amber-400">{o.id}</td>
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-white block">{o.guestName}</span>
                        <span className="font-mono text-stone-400">{o.phone}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-stone-200 block">{o.roomName}</span>
                        <span className="text-stone-500">{o.packageName}</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-stone-300">
                        {o.checkIn || '-'} → {o.checkOut || '-'}
                        <span className="block text-stone-500">
                          {o.nights} night(s) · {o.guests} guest(s)
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-stone-400 max-w-xs">{o.notes || '-'}</td>
                      <td className="py-3 pr-4 font-mono tabular-nums font-bold text-white">
                        ৳{o.total.toLocaleString('en-US')}
                      </td>
                      <td className="py-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatusChange(o.id, e.target.value as OrderItem['status'])
                          }
                          className="bg-stone-950 border border-stone-700 text-stone-200 rounded-md px-2 py-1 text-xs cursor-pointer"
                        >
                          {['Pending', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && adminData && (
          <div className="space-y-8">
            {/* Rooms Editor */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Manage Rooms & Tariffs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminData.rooms.map((room, index) => (
                  <RoomEditorCard
                    key={room.id}
                    room={room}
                    onSave={handleSaveRoom}
                    onUploadImage={handleUploadRoomImage}
                    onChangeLocal={(updated) => {
                      const next = [...adminData.rooms];
                      next[index] = updated;
                      setAdminData({ ...adminData, rooms: next });
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Packages Editor */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Manage Stay Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminData.packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-stone-400 block mb-1">Package Name (EN)</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => {
                            const next = [...adminData.packages];
                            next[index] = { ...pkg, name: e.target.value };
                            setAdminData({ ...adminData, packages: next });
                          }}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Package Name (BN)</label>
                        <input
                          type="text"
                          value={pkg.nameBn}
                          onChange={(e) => {
                            const next = [...adminData.packages];
                            next[index] = { ...pkg, nameBn: e.target.value };
                            setAdminData({ ...adminData, packages: next });
                          }}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Non-AC Price (৳)</label>
                        <input
                          type="number"
                          value={pkg.nonAcPrice}
                          onChange={(e) => {
                            const next = [...adminData.packages];
                            next[index] = { ...pkg, nonAcPrice: Number(e.target.value) };
                            setAdminData({ ...adminData, packages: next });
                          }}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">AC Price (৳)</label>
                        <input
                          type="number"
                          value={pkg.acPrice}
                          onChange={(e) => {
                            const next = [...adminData.packages];
                            next[index] = { ...pkg, acPrice: Number(e.target.value) };
                            setAdminData({ ...adminData, packages: next });
                          }}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-amber-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSavePackage(pkg)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Package</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && adminData && (
          <div className="space-y-8">
            {/* Add Photo Form */}
            <form
              onSubmit={handleAddGallery}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Photo to Gallery</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    placeholder="e.g. Deluxe Room View"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Title (বাংলা)</label>
                  <input
                    type="text"
                    value={galTitleBn}
                    onChange={(e) => setGalTitleBn(e.target.value)}
                    placeholder="যেমন: ডিলাক্স রুম"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Category *</label>
                  <select
                    value={galCategory}
                    onChange={(e) =>
                      setGalCategory(
                        e.target.value as 'rooms' | 'interior' | 'exterior' | 'facilities'
                      )
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="rooms">Rooms & Suites (rooms)</option>
                    <option value="interior">Common Areas & Lobby (interior)</option>
                    <option value="exterior">Exterior Views (exterior)</option>
                    <option value="facilities">Dining & Facilities (facilities)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Caption / Description (EN)</label>
                  <input
                    type="text"
                    value={galCaption}
                    onChange={(e) => setGalCaption(e.target.value)}
                    placeholder="Short caption describing this space..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Caption / Description (BN)</label>
                  <input
                    type="text"
                    value={galCaptionBn}
                    onChange={(e) => setGalCaptionBn(e.target.value)}
                    placeholder="বাংলা ক্যাপশন..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end">
                <div>
                  <label className="text-stone-400 block mb-1">Upload Image File (JPG/PNG/WEBP)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSelectGalleryFile(f);
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-300"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Or Image Path / URL</label>
                  <input
                    type="text"
                    value={galImageUrl}
                    onChange={(e) => setGalImageUrl(e.target.value)}
                    placeholder="/assets/img/..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Specs (Optional)</label>
                  <input
                    type="text"
                    value={galSpecs}
                    onChange={(e) => setGalSpecs(e.target.value)}
                    placeholder="e.g. 240 sq. ft. · Split AC"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingGal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingGal ? 'Uploading...' : 'Publish Photo to Gallery'}</span>
              </button>
            </form>

            {/* Existing Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {adminData.gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-stone-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3.5 text-xs">
                      <span className="text-amber-400 font-mono text-[11px]">{item.category}</span>
                      <h3 className="font-semibold text-white mt-0.5 truncate">{item.title}</h3>
                      <p className="text-stone-400 mt-1 line-clamp-2">{item.caption}</p>
                    </div>
                  </div>
                  <div className="p-3 pt-0 flex justify-end">
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && settingsDraft && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveSettings}
              className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs"
            >
              <h2 className="text-lg font-bold text-white mb-2">Guest House Website Settings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 block mb-1">Business Name (EN)</label>
                  <input
                    type="text"
                    value={settingsDraft.businessName}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, businessName: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Business Name (BN)</label>
                  <input
                    type="text"
                    value={settingsDraft.businessNameBn}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, businessNameBn: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsDraft.whatsappNumber}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, whatsappNumber: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Footer Contact Phone</label>
                  <input
                    type="text"
                    value={settingsDraft.footerContactNumber}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, footerContactNumber: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Address (English)</label>
                <input
                  type="text"
                  value={settingsDraft.address}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, address: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Address (বাংলা)</label>
                <input
                  type="text"
                  value={settingsDraft.addressBn}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, addressBn: e.target.value })
                  }
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 block mb-1">Check-In Policy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.checkInPolicy}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, checkInPolicy: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Check-Out Policy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.checkOutPolicy}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, checkOutPolicy: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Advance Payment Policy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.advancePaymentPolicy}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, advancePaymentPolicy: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Security & ID Policy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.securityPolicy}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, securityPolicy: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-stone-400 block mb-1">Hero Background Image URL</label>
                  <input
                    type="text"
                    value={settingsDraft.heroImage}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, heroImage: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Upload New Hero Image</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadHeroImage(f);
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </form>

            {/* Change Admin Password */}
            <form
              onSubmit={handleChangePassword}
              className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs self-start"
            >
              <h2 className="text-lg font-bold text-white">Admin Password</h2>
              <div>
                <label className="text-stone-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-stone-400 block mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

interface RoomEditorCardProps {
  room: RoomItem;
  onChangeLocal: (room: RoomItem) => void;
  onSave: (room: RoomItem) => void;
  onUploadImage: (room: RoomItem, file: File) => void;
}

const RoomEditorCard: React.FC<RoomEditorCardProps> = ({
  room,
  onChangeLocal,
  onSave,
  onUploadImage,
}) => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-amber-400 font-semibold">{room.id}</span>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={room.available}
            onChange={(e) => onChangeLocal({ ...room, available: e.target.checked })}
          />
          <span className={room.available ? 'text-emerald-400' : 'text-rose-400'}>
            {room.available ? 'Available' : 'Closed'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-stone-400 block mb-1">Name (EN)</label>
          <input
            type="text"
            value={room.name}
            onChange={(e) => onChangeLocal({ ...room, name: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="text-stone-400 block mb-1">Name (BN)</label>
          <input
            type="text"
            value={room.nameBn}
            onChange={(e) => onChangeLocal({ ...room, nameBn: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="text-stone-400 block mb-1">Price / Night (৳)</label>
          <input
            type="number"
            value={room.price}
            onChange={(e) => onChangeLocal({ ...room, price: Number(e.target.value) })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-amber-400 font-mono font-bold"
          />
        </div>
        <div>
          <label className="text-stone-400 block mb-1">Max Guests / Inventory</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={room.maxGuests}
              onChange={(e) => onChangeLocal({ ...room, maxGuests: Number(e.target.value) })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-mono"
            />
            <input
              type="number"
              value={room.totalInventory}
              onChange={(e) => onChangeLocal({ ...room, totalInventory: Number(e.target.value) })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-stone-400 block mb-1">Description (EN)</label>
        <textarea
          rows={2}
          value={room.description}
          onChange={(e) => onChangeLocal({ ...room, description: e.target.value })}
          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Photo</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadImage(room, f);
            }}
          />
        </label>

        <button
          onClick={() => onSave(room)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Room</span>
        </button>
      </div>
    </div>
  );
};
