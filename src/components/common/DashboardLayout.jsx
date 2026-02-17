import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Dna,
  FileText,
  Users,
  Megaphone,
  PenSquare,
  UserCog,
  User,
  ArrowLeft,
  Globe,
  LogOut,
  Menu,
} from 'lucide-react'
import logo from '../../assets/icons/logo.png'

export default function DashboardLayout() {
  const { profile, user, logout, role } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const [sheetOpen, setSheetOpen] = useState(false)

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.overview'), end: true },
    { to: '/dashboard/variants', icon: Dna, label: t('nav.variants') },
    { to: '/dashboard/reports', icon: FileText, label: t('nav.reports') },
    { to: '/dashboard/researchers', icon: Users, label: t('nav.researchers') },
    { to: '/dashboard/announcements', icon: Megaphone, label: t('nav.announcements') },
    ...((role === 'admin' || role === 'coordinator') ? [{ to: '/dashboard/blog', icon: PenSquare, label: t('nav.blog') }] : []),
    ...(role === 'admin' ? [{ to: '/dashboard/members', icon: UserCog, label: t('nav.members') }] : []),
  ]

  function SidebarContent({ onNavigate }) {
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-6">
          <img src={logo} alt="K-ARC" className="h-8" />
          <span className="font-semibold text-slate-900">K-ARC</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t px-3 py-4 space-y-1">
          <NavLink
            to="/dashboard/profile"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
              )
            }
          >
            <User className="h-4 w-4 shrink-0" />
            {t('nav.profile')}
          </NavLink>

          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {t('nav.backToSite')}
          </Link>

          <div className="my-2 border-t" />

          {/* User info */}
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-slate-900 truncate">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>

          {/* Language + Logout */}
          <div className="flex items-center gap-2 px-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === 'en' ? '한국어' : 'EN'}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile header + Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b bg-white px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <img src={logo} alt="K-ARC" className="h-7" />
        <span className="font-semibold text-slate-900">K-ARC</span>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        <div className="pt-14 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
