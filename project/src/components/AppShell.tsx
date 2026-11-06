import { NavLink, Outlet } from "react-router-dom";
import { BookIcon, ChatIcon, HistoryIcon, HomeIcon, QuizIcon } from "./icons";
import { SetupBanner } from "./SetupBanner";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", Icon: HomeIcon, end: true },
  { to: "/learn", label: "AI Learning", Icon: BookIcon, end: false },
  { to: "/ask", label: "Ask AI", Icon: ChatIcon, end: false },
  { to: "/quiz", label: "Quiz", Icon: QuizIcon, end: false },
  { to: "/history", label: "History", Icon: HistoryIcon, end: false },
];

function navClass(isActive: boolean, layout: "side" | "bottom") {
  const common = "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-cyan-400";
  if (layout === "side") {
    return `${common} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
      isActive ? "bg-cyan-400/15 text-cyan-300" : "text-slate-300 hover:bg-navy-800 hover:text-white"
    }`;
  }
  return `${common} flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium ${
    isActive ? "text-cyan-300" : "text-slate-400 hover:text-white"
  }`;
}

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-navy-700 bg-navy-950/90 p-6 backdrop-blur lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-navy-900 font-bold">T</span>
          <div>
            <p className="text-base font-semibold text-white">TeachMe AI</p>
            <p className="text-xs text-slate-400">Your personal AI teacher</p>
          </div>
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navClass(isActive, "side")}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-[1.5] text-slate-500">Learn anything, one simple step at a time.</p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-700 bg-navy-900/90 px-4 py-4 backdrop-blur lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-navy-900 font-bold">T</span>
          <p className="text-base font-semibold text-white">TeachMe AI</p>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <SetupBanner />
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-navy-700 bg-navy-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      >
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => navClass(isActive, "bottom")}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
