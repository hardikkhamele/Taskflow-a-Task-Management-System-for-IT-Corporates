import React, { useState, useEffect, useContext } from 'react';
import {
  AuthContext,
  ROLE_OPTIONS,
  DESIGNATION_OPTIONS,
  PRESET_AVATARS,
} from '../context/AuthContext';
import DeleteModal from '../components/DeleteModal';
import ImageCropModal from '../components/ImageCropModal';
import Avatar from '../components/Avatar';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Key,
  Save,
  UserPlus,
  Briefcase,
  Crop,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const {
    user,
    usersList,
    updateProfile,
    updateUserByAdmin,
    createUserByAdmin,
    deleteUserByAdmin,
    isAdmin,
  } = useContext(AuthContext);

  // Self Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [designation, setDesignation] = useState(user?.designation || 'Associate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savingSelf, setSavingSelf] = useState(false);

  // Admin User Editing State
  const [selectedUserEdit, setSelectedUserEdit] = useState(null);
  const [adminEditName, setAdminEditName] = useState('');
  const [adminEditEmail, setAdminEditEmail] = useState('');
  const [adminEditRole, setAdminEditRole] = useState('Employee');
  const [adminEditDesignation, setAdminEditDesignation] = useState('Associate');
  const [adminEditAvatar, setAdminEditAvatar] = useState('');
  const [adminEditPassword, setAdminEditPassword] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Frontend Developer');
  const [newMemberDesignation, setNewMemberDesignation] = useState('Associate');
  const [newMemberAvatar, setNewMemberAvatar] = useState(PRESET_AVATARS[0]);
  const [addingMember, setAddingMember] = useState(false);

  // Image Cropper Popup Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [cropTargetCallback, setCropTargetCallback] = useState(null);

  // Delete User Confirmation State
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDesignation(user.designation || 'Associate');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Open Cropper Modal when user chooses an image file
  const handleFileSelected = (e, callbackSetter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file should be under 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result);
        setCropTargetCallback(() => (croppedResult) => {
          callbackSetter(croppedResult);
          toast.success('Photo adjusted and applied!');
        });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Submit Self Profile Update
  const handleSelfUpdate = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingSelf(true);

    const activeAvatar = customAvatarUrl || avatar;

    const payload = {
      name,
      email,
      designation,
      avatar: activeAvatar,
    };
    if (password) {
      payload.password = password;
    }

    const res = await updateProfile(payload);
    setSavingSelf(false);

    if (res.success) {
      toast.success('Profile and credentials updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setCustomAvatarUrl('');
    } else {
      toast.error(res.message || 'Failed to update profile');
    }
  };

  // Open Admin Edit Modal for a user
  const handleStartAdminEdit = (u) => {
    setSelectedUserEdit(u);
    setAdminEditName(u.name || '');
    setAdminEditEmail(u.email || '');
    setAdminEditRole(u.role || 'Employee');
    setAdminEditDesignation(u.designation || 'Associate');
    setAdminEditAvatar(u.avatar || '');
    setAdminEditPassword('');
  };

  // Save Admin Edit
  const handleAdminSave = async (e) => {
    e.preventDefault();
    if (!selectedUserEdit) return;

    setSavingAdmin(true);

    const payload = {
      name: adminEditName,
      email: adminEditEmail,
      role: adminEditRole,
      designation: adminEditDesignation,
      avatar: adminEditAvatar,
    };
    if (adminEditPassword) {
      payload.password = adminEditPassword;
    }

    const res = await updateUserByAdmin(selectedUserEdit._id, payload);
    setSavingAdmin(false);

    if (res.success) {
      toast.success(`Credentials & Photo for ${adminEditName} updated successfully!`);
      setSelectedUserEdit(null);
    } else {
      toast.error(res.message || 'Failed to update user credentials');
    }
  };

  // Add New Team Member Submit
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail || !newMemberPassword) {
      toast.error('Please enter name, email, and password');
      return;
    }

    setAddingMember(true);

    const memberPayload = {
      name: newMemberName,
      email: newMemberEmail,
      password: newMemberPassword,
      role: newMemberRole,
      designation: newMemberDesignation,
      avatar: newMemberAvatar,
    };

    const res = await createUserByAdmin(memberPayload);
    setAddingMember(false);

    if (res.success) {
      toast.success(`New team member ${newMemberName} added successfully!`);
      setAddMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPassword('');
      setNewMemberRole('Frontend Developer');
      setNewMemberDesignation('Associate');
    } else {
      toast.error(res.message || 'Failed to add team member');
    }
  };

  // Confirm Delete User
  const handleDeleteUserConfirm = async () => {
    if (!deleteUserId) return;
    const res = await deleteUserByAdmin(deleteUserId);
    setDeleteUserId(null);
    if (res.success) {
      toast.success('User account removed successfully');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Account & Credentials Management</h2>
        <p className="text-xs text-slate-500">
          Update profile information, crop & upload employee photos, roles, designations, and team members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Self Profile Overview Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs text-center">
          <div className="relative inline-block mx-auto">
            <Avatar
              src={customAvatarUrl || avatar}
              name={user?.name}
              className="w-28 h-28 border-4 border-blue-500/20 shadow-md mx-auto"
              textClassName="text-3xl"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{user?.name}</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">
              {user?.designation || 'Associate'}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {user?.role}
            </span>
          </div>

          {/* Quick Avatar Selector & Upload Button */}
          <div className="pt-4 border-t border-slate-100 text-left space-y-3">
            {/* Upload & Crop Photo Button */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-semibold text-slate-600">Upload Picture</label>
              <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 text-xs font-bold cursor-pointer transition-colors">
                <Crop className="w-4 h-4" />
                <span>Upload Picture...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileSelected(e, (cropped) => {
                      setAvatar(cropped);
                      setCustomAvatarUrl('');
                    })
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Update Credentials Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Personal Profile & Credentials</h3>
            <p className="text-xs text-slate-500">Update your display name, primary email, designation level, or password.</p>
          </div>

          <form onSubmit={handleSelfUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Designation Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  >
                    {DESIGNATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password (Optional)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>


            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingSelf}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {savingSelf ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ADMIN CONTROL PANEL: User & Member Management */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                Admin Control Panel
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Manage Team Members & Credentials</h3>
              <p className="text-xs text-slate-500">
                Add new team members, crop employee photos, update roles, designations, or reset passwords.
              </p>
            </div>

            {/* ADD NEW MEMBER BUTTON */}
            <button
              onClick={() => setAddMemberModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Member</span>
            </button>
          </div>

          {/* Users List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">User Member</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-semibold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <Avatar src={u.avatar} name={u.name} className="w-10 h-10" textClassName="text-sm" />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px] border border-blue-100">
                        {u.designation || 'Associate'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px] border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartAdminEdit(u)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg border border-blue-200 transition-colors inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {u._id !== user._id && (
                          <button
                            onClick={() => setDeleteUserId(u._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD NEW MEMBER MODAL */}
          {addMemberModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <UserPlus className="w-5 h-5" />
                    <h3 className="text-base font-bold text-slate-900">Add New Team Member</h3>
                  </div>
                  <button
                    onClick={() => setAddMemberModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
                  {/* Photo Preview in Modal */}
                  <div className="text-center pb-2">
                    <Avatar src={newMemberAvatar} name={newMemberName || 'Member'} className="w-20 h-20 mx-auto mb-2 border-2 border-blue-200" textClassName="text-xl" />
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 cursor-pointer transition-colors">
                      <Crop className="w-3.5 h-3.5" />
                      <span>Upload & Adjust Photo...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelected(e, setNewMemberAvatar)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Robert Martin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="robert@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* ROLE DROPDOWN */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DESIGNATION DROPDOWN */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation Level *</label>
                    <select
                      value={newMemberDesignation}
                      onChange={(e) => setNewMemberDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {DESIGNATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>



                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAddMemberModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center space-x-1"
                    >
                      {addingMember ? 'Creating...' : '+ Create Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADMIN EDIT USER MODAL */}
          {selectedUserEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Edit Member: {selectedUserEdit.name}</h3>
                  <button
                    onClick={() => setSelectedUserEdit(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAdminSave} className="space-y-4 text-xs">
                  {/* Photo Preview & Crop button */}
                  <div className="text-center pb-2">
                    <Avatar src={adminEditAvatar} name={adminEditName || 'Member'} className="w-20 h-20 mx-auto mb-2 border-2 border-blue-200" textClassName="text-xl" />
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 cursor-pointer transition-colors">
                      <Crop className="w-3.5 h-3.5" />
                      <span>Upload & Adjust Photo...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelected(e, setAdminEditAvatar)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">User Name</label>
                    <input
                      type="text"
                      required
                      value={adminEditName}
                      onChange={(e) => setAdminEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={adminEditEmail}
                      onChange={(e) => setAdminEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* EDIT ROLE */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                    <select
                      value={adminEditRole}
                      onChange={(e) => setAdminEditRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EDIT DESIGNATION */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                    <select
                      value={adminEditDesignation}
                      onChange={(e) => setAdminEditDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {DESIGNATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reset Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Enter new password to reset"
                      value={adminEditPassword}
                      onChange={(e) => setAdminEditPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedUserEdit(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAdmin}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-colors"
                    >
                      {savingAdmin ? 'Saving...' : 'Save Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete User Confirmation Modal */}
          <DeleteModal
            isOpen={Boolean(deleteUserId)}
            onClose={() => setDeleteUserId(null)}
            onConfirm={handleDeleteUserConfirm}
            title="Delete User Account"
            message="Are you sure you want to permanently remove this user member account from TaskFlow?"
          />
        </div>
      )}

      {/* POPUP IMAGE CROP & ADJUSTMENT MODAL */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedResult) => {
          if (cropTargetCallback) {
            cropTargetCallback(croppedResult);
          }
        }}
      />
    </div>
  );
};

export default Profile;
