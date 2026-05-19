import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, BarChart3, Users,Smile, MessagesSquare, AlertTriangle, Dumbbell,} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../utils/authUtils'

const Sidebar = ({ isOpen, setIsOpen, isStudent = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const studentLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Assessment', href: '/assessment', icon: BarChart3 },
    { label: 'Mood Tracker', href: '/mood-tracker', icon: Smile },
    { label: 'AI Chat', href: '/chat', icon: MessagesSquare },
    { label: 'Coping Strategies', href: '/coping-strategies', icon: Dumbbell },
  ]

  const adminLinks = [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Student Records', href: '/admin/assessments', icon: Users },
    { label: 'High-Risk Alerts', href: '/admin/risk-monitoring', icon: AlertTriangle },
  ]

  const links = isStudent ? studentLinks : adminLinks

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (href) => location.pathname === href

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-teal-800 text-white shadow-lg transform transition-transform duration-300 z-40 overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
       <div className="p-6 flex-1 overflow-y-auto">

  <div className="flex items-center gap-3 mb-8 flex-shrink-0">

    {/* Logo */}
    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md flex-shrink-0">

      <img
         src="/mindmate/public/gordon college logo.png"
        alt="MindMate Logo"
        className="w-full h-full object-cover"
      />

    </div>

    {/* Text */}
    <div className="min-w-0">

      <h1 className="font-bold text-lg truncate">
        MindMate
      </h1>

      <p className="text-xs text-teal-200 truncate">
        {isStudent ? 'Student Portal' : 'Admin Portal'}
      </p>

    </div>

  </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline overflow-hidden ${
                  isActive(link.href)
                    ? 'bg-teal-700 text-white'
                    : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                }`}
              >
                {typeof link.icon === 'string' ? (
                  <span className="text-xl flex-shrink-0">{link.icon}</span>
                ) : (
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="flex-shrink-0 truncate">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-teal-700">
          <div className="mb-4 p-3 bg-teal-700 rounded-lg">
            <p className="text-sm text-teal-100">Signed in as:</p>
            <p className="font-medium text-white truncate">{profile?.name || profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-teal-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}

const StudentLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isStudent={true} />

      <main className="flex-1 w-full lg:ml-64">
        <div className="lg:hidden h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {pageTitle && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

const AdminLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isStudent={false} />

      <main className="flex-1 w-full lg:ml-64">
        <div className="lg:hidden h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {pageTitle && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export { StudentLayout, AdminLayout, Sidebar }
