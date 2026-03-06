import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Dashboard />
      </main>
    </div>
  )
}
