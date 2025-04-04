import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function registerUser(ev) {
    ev.preventDefault();

    // Basic client-side validation
    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      await axios.post('/api/register', { name, email, password });
      alert('Registration successful. Now you can log in');
    } catch (e) {
      // Optionally, inspect e.response.data for more error details
      alert('Registration failed. Please try again later');
      console.error(e.response?.data || e);
    }
  }
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input type="text"
            placeholder="Name"
            value={name}
            onChange={ev => setName(ev.target.value)} />
          <input type="email"
            placeholder="your@email.com"
            value={email}
            onChange={ev => setEmail(ev.target.value)} />
          <input type="password"
            placeholder="password"
            value={password}
            onChange={ev => setPassword(ev.target.value)} />
          <button className="primary">Register</button>
          <div className="text-center py-2 text-gray-500">
            Already a member? <Link className="underline text-black" to={'/login'}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
