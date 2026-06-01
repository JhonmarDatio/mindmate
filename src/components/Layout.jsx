import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, BarChart3, Users, Smile, MessagesSquare, AlertTriangle, BookOpen, ShieldCheck, UserCog } from 'lucide-react'
import { signOut } from '../utils/authUtils'

// role: 'student' | 'counselor' | 'superadmin'
const Sidebar = ({ isOpen, setIsOpen, role = 'student' }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const studentLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Assessment', href: '/assessment', icon: BarChart3 },
    { label: 'Mood Tracker', href: '/mood-tracker', icon: Smile },
    { label: 'AI Chat', href: '/chat', icon: MessagesSquare },
    { label: 'Coping Strategies', href: '/coping-strategies', icon: BookOpen },
  ]

  const counselorLinks = [
    { label: 'Dashboard', href: '/counselor', icon: Home },
    { label: 'Student Records', href: '/counselor/assessments', icon: Users },
    { label: 'High-Risk Alerts', href: '/counselor/risk-monitoring', icon: AlertTriangle },
  ]

  const superadminLinks = [
    { label: 'Overview',         href: '/superadmin',       icon: ShieldCheck },
    { label: 'Manage Accounts',  href: '/superadmin/users', icon: UserCog },
  ]

  const links =
    role === 'student'
      ? studentLinks
      : role === 'counselor'
      ? counselorLinks
      : superadminLinks

  const portalLabel =
    role === 'student'
      ? 'Student Portal'
      : role === 'counselor'
      ? 'Counselor Portal'
      : 'Admin Portal'

  const sidebarBg   = role === 'superadmin' ? 'bg-gray-900' : 'bg-teal-800'
  const activeBg    = role === 'superadmin' ? 'bg-gray-700' : 'bg-teal-700'
  const hoverBg     = role === 'superadmin' ? 'hover:bg-gray-700' : 'hover:bg-teal-700'
  const borderColor = role === 'superadmin' ? 'border-gray-700/60' : 'border-teal-700/60'
  const mobileBtn   = role === 'superadmin' ? 'bg-gray-700' : 'bg-teal-600'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (href) => location.pathname === href

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-screen w-64 ${sidebarBg} text-white shadow-lg transform transition-transform duration-300 z-40 overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md flex-shrink-0">
              <img src="/gordon-college-logo.png" alt="MindMate Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">MindMate</h1>
              <p className="text-xs text-teal-200 truncate">{portalLabel}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 no-underline overflow-hidden ${
                  isActive(link.href)
                    ? `${activeBg} text-white`
                    : `text-teal-100 ${hoverBg} hover:text-white`
                }`}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className={`p-6 border-t ${borderColor} ${sidebarBg} flex-shrink-0`}>
          {role === 'student' && (
            <div className="mb-4 p-3 bg-teal-900/30 border border-teal-700/40 rounded-xl">
              <p className="text-[11px] text-teal-100/90 leading-relaxed font-medium text-center italic">
                This system is for  support purposes only and is not a substitute for professional mental health services.
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-transparent border border-teal-600 hover:bg-red-600 hover:border-red-600 text-teal-100 hover:text-white font-medium py-2 px-4 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 ${mobileBtn} text-white rounded-lg`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}

const StudentLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role="student" />
      <main className="flex-1 w-full lg:ml-64">
        <div className="lg:hidden h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {pageTitle && <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1></div>}
          {children}
        </div>
      </main>
    </div>
  )
}

const CounselorLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role="counselor" />
      <main className="flex-1 w-full lg:ml-64">
        <div className="lg:hidden h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {pageTitle && <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1></div>}
          {children}
        </div>
      </main>
    </div>
  )
}

const SuperAdminLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role="superadmin" />
      <main className="flex-1 w-full lg:ml-64">
        <div className="lg:hidden h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {pageTitle && <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1></div>}
          {children}
        </div>
      </main>
    </div>
  )
}

const AdminLayout = CounselorLayout

export { StudentLayout, CounselorLayout, AdminLayout, SuperAdminLayout, Sidebar }