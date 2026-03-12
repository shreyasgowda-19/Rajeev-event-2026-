import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../common/Button';
import { 
  Menu, X, Sun, Moon, Monitor, User, LogOut, 
  Stethoscope, Calendar, FileText, Pill 
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    patient: [
      { to: '/dashboard', label: 'Dashboard', icon: User },
      { to: '/doctors', label: 'Find Doctors', icon: Stethoscope },
      { to: '/appointments', label: 'Appointments', icon: Calendar },
      { to: '/reports', label: 'My Reports', icon: FileText },
      { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
    ],
    doctor: [
      { to: '/doctor/dashboard', label: 'Dashboard', icon: User },
      { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
      { to: '/doctor/profile', label: 'Profile', icon: Stethoscope },
    ],
  };

  const currentNav = role ? navLinks[role] : [];

  return (
    <nav className="sticky top-0 z-50 bg-theme-primary border-b border-theme shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-theme-primary">
                Medi<span className="text-primary-600">Link</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && currentNav.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-lg text-theme-secondary hover:bg-theme-secondary transition-colors"
              >
                {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-theme-primary border border-theme rounded-lg shadow-lg py-1">
                  <button
                    onClick={() => { setTheme('light'); setIsProfileOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary flex items-center space-x-2"
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setIsProfileOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary flex items-center space-x-2"
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setIsProfileOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary flex items-center space-x-2"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-sm text-theme-secondary">
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-theme-secondary hover:bg-theme-secondary"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-theme-primary border-t border-theme">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {isAuthenticated && currentNav.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
