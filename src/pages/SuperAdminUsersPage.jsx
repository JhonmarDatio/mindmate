import React, { useState, useEffect, useCallback } from 'react'
import { SuperAdminLayout } from '../components/Layout'
import { UserCog, Trash2, ShieldCheck, GraduationCap, Stethoscope, Search } from 'lucide-react'
import { getAllUsers, updateUserRole, deleteUser } from '../utils/databaseUtils'

const ROLE_OPTIONS = ['student', 'counselor', 'superadmin']

const roleBadge = {
  student:    'bg-teal-50 text-teal-600 border-teal-100',
  counselor:  'bg-purple-50 text-purple-600 border-purple-100',
  superadmin: 'bg-orange-50 text-orange-600 border-orange-100',
}

const roleIcon = {
  student:    GraduationCap,
  counselor:  Stethoscope,
  superadmin: ShieldCheck,
}

const SuperAdminUsersPage = () => {
  const [users, setUsers]               = useState([])
  const [searchTerm, setSearchTerm]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [successMsg, setSuccessMsg]     = useState('')
  const [loading, setLoading]           = useState(true)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { users: data, error } = await getAllUsers()
    if (!error) setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleRoleChange = async (userId, newRole) => {
    const { success, error } = await updateUserRole(userId, newRole)
    if (success) {
      await loadUsers()
      setSuccessMsg('Role updated successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setSuccessMsg(`Error: ${error}`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const handleDelete = async (userId) => {
    const { success, error } = await deleteUser(userId)
    if (success) {
      await loadUsers()
      setConfirmDelete(null)
      setSuccessMsg('User removed successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setSuccessMsg(`Error: ${error}`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase()
    return (
      !searchTerm ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  return (
    <SuperAdminLayout pageTitle={
      <div className="flex items-center gap-2 text-gray-800">
        <UserCog className="w-6 h-6 text-orange-500" />
        <span>Manage Users</span>
      </div>
    }>
      <p className="text-gray-500 text-sm mb-6 -mt-2">
        View, change roles, or remove user accounts from the system.
      </p>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Change Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const Icon = roleIcon[user.role] || UserCog
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{user.name || '—'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 text-sm text-gray-500">{user.email}</td>

                      {/* Current role badge */}
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${roleBadge[user.role] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Role selector */}
                      <td className="px-6 py-3.5 text-center">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-sm text-gray-400">Loading users...</div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Remove User</p>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently remove this user?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-400 leading-relaxed">
        <p className="font-bold text-gray-500 mb-1">Admin Notice:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-1">
          <li>Changing a user's role takes effect immediately on their next login.</li>
          <li>Deleting a user removes their account but does NOT delete their assessment or chat data.</li>
          <li>You cannot delete your own account from this panel.</li>
        </ul>
      </div>
    </SuperAdminLayout>
  )
}

export default SuperAdminUsersPage
