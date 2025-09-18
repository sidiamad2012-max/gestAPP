import { useState, useEffect } from "react";
import { UserRoleProvider, useUserRole } from "./contexts/UserRoleContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { Sidebar } from "./components/Sidebar";
import { TenantLogin } from "./components/TenantLogin";
import { OwnerLogin } from "./components/OwnerLogin";
import { RoleSelector } from "./components/RoleSelector";
import { Toaster } from "./components/ui/sonner";
import { PropertyOverview } from "./components/PropertyOverview";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { TestSupabase } from "./components/TestSupabase";
import { UnitsInventory } from "./components/UnitsInventory";
import { TenantManagement } from "./components/TenantManagement";
import { MaintenanceTracker } from "./components/MaintenanceTracker";
import { TenantDashboard } from "./components/tenant/TenantDashboard";
import { TenantMaintenance } from "./components/tenant/TenantMaintenance";
import { TenantPayments } from "./components/tenant/TenantPayments";
import { TenantProfile } from "./components/tenant/TenantProfile";

type LandlordSection = 'overview' | 'units' | 'tenants' | 'maintenance' | 'finances' | 'settings';
type TenantSection = 'dashboard' | 'maintenance' | 'payments' | 'profile';
type ActiveSection = LandlordSection | TenantSection;

function ErrorFallback({ error }: { error: string }) {
  return (
    <div className="p-6">
      <div className="text-center">
        <h2>Module en développement</h2>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Cette fonctionnalité sera bientôt disponible.</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { role, isAuthenticated } = useUserRole();
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    role === 'landlord' ? 'overview' : 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    if (role === 'landlord') {
      setActiveSection('overview');
    } else {
      setActiveSection('dashboard');
    }
  }, [role]);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('hasSelectedRole')) {
      setShowRoleSelector(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (role) {
      setShowRoleSelector(false);
      localStorage.setItem('hasSelectedRole', 'true');
    }
  }, [role]);

  if (showRoleSelector) {
    return <RoleSelector />;
  }

  if (!isAuthenticated) {
    return role === 'landlord' ? <OwnerLogin /> : <TenantLogin />;
  }

  const renderContent = () => {
    if (role === 'landlord') {
      switch (activeSection as LandlordSection) {
        case 'overview':
          return <PropertyOverview />;
        case 'units':
          return <UnitsInventory />;
        case 'tenants':
          return <TenantManagement />;
        case 'maintenance':
          return <MaintenanceTracker />;
        case 'finances':
          return <FinancialDashboard />;
        case 'settings':
          return <TestSupabase />;
        default:
          return <PropertyOverview />;
      }
    } else {
      switch (activeSection as TenantSection) {
        case 'dashboard':
          return <TenantDashboard />;
        case 'maintenance':
          return <TenantMaintenance />;
        case 'payments':
          return <TenantPayments />;
        case 'profile':
          return <TenantProfile />;
        default:
          return <TenantDashboard />;
      }
    }
  };

  return (
    <NavigationProvider activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="flex h-screen bg-background">
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-border p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-accent rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>
          
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <UserRoleProvider>
      <AppContent />
      <Toaster />
    </UserRoleProvider>
  );
}