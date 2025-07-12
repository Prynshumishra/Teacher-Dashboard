import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("token", "dummy-token");
    } else {
      sessionStorage.setItem("token", "dummy-token");
    }

    navigate("/dashboard");
  };

  const handleGithubLogin = () => {
    window.location.href = "https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-xl w-full max-w-sm text-gray-800 dark:text-white">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="App Logo" className="h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-semibold">Teacher Admin Login</h2>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={() => setRememberMe((prev) => !prev)}
            className="mr-2"
          />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button
          onClick={handleLogin}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Login
        </button>

        <div className="text-center text-sm text-gray-500 mb-2">or</div>

        <button
  onClick={handleGithubLogin}
  className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded text-gray-800 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
>
  <FaGithub className="text-xl" />
  Login with GitHub
</button>

      </div>
    </div>
  );
};

export default Login;
