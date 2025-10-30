import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

const BottomNavigation = () => {
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: "Plans",
      path: "/workout-plans",
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardDocumentListIconSolid,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-elevated)]/98 border-t border-[var(--border-primary)] backdrop-blur-xl safe-area-bottom"
      style={{ boxShadow: "var(--shadow-xl)" }}
      aria-label="Main navigation"
    >
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex justify-around items-center h-20" role="list">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ease-out relative touch-manipulation ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:scale-95"
                }`
              }
              aria-label={`Navigate to ${item.name}`}
              role="listitem"
            >
              {({ isActive }) => {
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                  <>
                    {}
                    {isActive && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full"
                        style={{ backgroundColor: "var(--accent-primary)" }}
                      />
                    )}

                    {}
                    <div
                      className={`relative transition-all duration-200 ${
                        isActive
                          ? "transform -translate-y-0.5"
                          : "transform translate-y-0"
                      }`}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-2xl blur-lg scale-150 opacity-20"
                          style={{ backgroundColor: "var(--accent-primary)" }}
                        />
                      )}
                      <Icon
                        className={`w-6 h-6 relative z-10 transition-all duration-200 ${
                          isActive ? "scale-110" : "scale-100"
                        }`}
                        style={{
                          strokeWidth: isActive ? 2.5 : 2,
                          color: "currentColor",
                        }}
                      />
                    </div>

                    {}
                    <span
                      className={`text-xs mt-1.5 font-semibold transition-all duration-200 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                      style={{ letterSpacing: "-0.011em" }}
                    >
                      {item.name}
                    </span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
