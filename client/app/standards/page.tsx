import Sidebar from '../components/Sidebar';
export default function Standards() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold mb-4">🏷️ Standards & Tags</h1>
        <p className="text-gray-600">Define learning objectives and taxonomy tags.</p>
      </div>
    </div>
  );
}