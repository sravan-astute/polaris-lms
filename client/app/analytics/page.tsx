import Sidebar from '../components/Sidebar';
export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold mb-4">📊 Performance Analytics</h1>
        <p className="text-gray-600">View student performance and item difficulty analysis.</p>
      </div>
    </div>
  );
}