'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLogin = async (role: 'STUDENT' | 'TEACHER') => {
    // 1. Create the Fake Token based on which button you clicked
    const userEmail = role === 'STUDENT' ? 'jane@canvas.edu' : 'prof@canvas.edu';
    const userName = role === 'STUDENT' ? 'Jane Doe' : 'Professor Smith';
    const rolesClaim = role === 'STUDENT' 
      ? ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"]
      : ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"];

    // Construct a fake JWT payload
    const payload = {
      email: userEmail,
      name: userName,
      iss: "https://canvas.test",
      "https://purl.imsglobal.org/spec/lti/claim/roles": rolesClaim,
      "https://purl.imsglobal.org/spec/lti/claim/context": { title: "Biology 101" }
    };

    // Encode it simply (in a real app, this is signed crypto, but our backend parser handles simple base64 for dev if we want, 
    // BUT since our backend expects a signed JWT string, we will send the PRE-MADE tokens we used in PowerShell)
    
    // We will use the exact same hardcoded tokens from the PowerShell script to keep it simple:
    const studentToken = "fakeheader.eyJlbWFpbCI6ImphbmVAY2FudmFzLmVkdSIsIm5hbWUiOiJKYW5lIERvZSIsImlzcyI6Imh0dHBzOi8vY2FudmFzLnRlc3QiLCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9yb2xlcyI6WyJodHRwOi8vcHVybC5pbXNnbG9iYWwub3JnL3ZvY2FiL2xpcy92Mi9tZW1iZXJzaGlwI0xlYXJuZXIiXSwiaHR0cHM6Ly9wdXJsLmltc2dsb2JhbC5vcmcvc3BlYy9sdGkvY2xhaW0vY29udGV4dCI6eyJ0aXRsZSI6IkJpb2xvZ3kgMTAxIn19.fakesignature";
    
    const teacherToken = "fakeheader.eyJlbWFpbCI6ImphbmVAY2FudmFzLmVkdSIsIm5hbWUiOiJQcm9mZXNzb3IgU21pdGgiLCJpc3MiOiJodHRwczovL2NhbnZhcy50ZXN0IiwiaHR0cHM6Ly9wdXJsLmltc2dsb2JhbC5vcmcvc3BlYy9sdGkvY2xhaW0vcm9sZXMiOlsiaHR0cDovL3B1cmwuaW1zZ2xvYmFsLm9yZy92b2NhYi9saXMvdjIvbWVtYmVyc2hpcCNJbnN0cnVjdG9yIl0sImh0dHBzOi8vcHVybC5pbXNnbG9iYWwub3JnL3NwZWMvbHRpL2NsYWltL2NvbnRleHQiOnsidGl0bGUiOiJCaW9sb2d5IDEwMSJ9fQ==.fakesignature";

    const tokenToSend = role === 'STUDENT' ? studentToken : teacherToken;

    // 2. Send it to the Backend
    // ... inside handleLogin ...
    try {
      const response = await fetch('http://localhost:3000/lti/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: tokenToSend }),
        credentials: 'include' // 👈 Essential: Accepts the cookie!
      });

      if (response.ok) {
         console.log("Login successful. Redirecting...");
         // NOW we move the user manually
         router.push('/dashboard');
      } else {
        alert("Login failed!");
      }

    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">🚀 Polaris Engine Dev Launchpad</h1>
      <p className="mb-8 text-gray-400">Simulate an LTI Launch from Canvas</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => handleLogin('STUDENT')}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
        >
          🎓 Launch as Jane (Student)
        </button>

        <button 
          onClick={() => handleLogin('TEACHER')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
        >
          👩‍🏫 Launch as Prof (Teacher)
        </button>
      </div>
    </main>
  );
}