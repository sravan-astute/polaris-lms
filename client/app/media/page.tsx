import Sidebar from '../components/Sidebar';
export default function MediaLibrary() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold mb-4">🖼️ Media Library</h1>
        <p className="text-gray-600">Upload and manage images, videos, and audio files.</p>
      </div>
    </div>
  );
}