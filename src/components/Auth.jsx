import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/habitApi';
import './css/Auth.css';

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = isLogin 
                ? await loginUser({ username: formData.username, password: formData.password })
                : await registerUser(formData);

            if (result.status === "success") {
                localStorage.setItem('token', result.data.accessToken);
                onLoginSuccess();
            } else {
                alert(result.message || "Terjadi kesalahan");
            }
        } catch (error) {
            alert("Gagal terhubung ke server");
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? "Sign In" : "Register"}</h2>
                    <p>{isLogin ? "Enter your credentials to continue" : "Create a new account to start tracking"}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            required 
                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="input-group">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                required 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                    )}
                    
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary">
                        {isLogin ? "Login" : "Create Account"}
                    </button>
                </form>
                
                <p className="toggle-auth">
                    {isLogin ? "Don't have an account?" : "Already have an account?"} 
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? " Register" : " Login"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;