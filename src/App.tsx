import { Suspense } from "react";

import ChartDashboard from "./components/dashboard/ChartDashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-slate-400">
            초기화를 진행 중입니다...
          </div>
        }
      >
        <ChartDashboard />
      </Suspense>
    </div>
  );
}

export default App;
