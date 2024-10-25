import { Link, useNavigate } from "react-router-dom";
import LibImg from "../Assets/libraryImg.jpg";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
    const [passwordEntered, setPasswordEntered] = useState("");
    const [userName, setUserName] = useState("");
    const [valid, setValid] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [loading, setLoading] = useState(false); 
    const [otp, setOtp] = useState(""); 
    const [otpSent, setOtpSent] = useState(false); 
    const [otpVerified, setOtpVerified] = useState(false); 
    const nav = useNavigate();

    useEffect(() => {
        async function verifyToken() {
            const loginTokenStored = localStorage.getItem("LoginToken");
            if (!loginTokenStored) return;

            try {
                const response = await fetch(`http://localhost:5000/getToken/${loginTokenStored}`);
                if (!response.ok) {
                    console.error('Failed to verify token:', await response.text());
                    return;
                }
                const data = await response.json();
                if (data.type === "LoginToken") {
                    setValid(true);
                }
            } catch (error) {
                console.error('Token verification error:', error);
            }
        }
        verifyToken();
    }, []);

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
        setCaptchaVerified(!!token);
    };

    async function sendOtp() {
        try {
            const response = await fetch(`http://localhost:5000/sendOtp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userName }),
            });
            const data = await response.json();
            if (data.success) {
                alert("OTP sent successfully!");
                setOtpSent(true);
            } else {
                alert("Failed to send OTP. Try again.");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    }

    async function verifyOtp() {
        try {
            const response = await fetch(`http://localhost:5000/verifyOtp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userName, otp }),
            });
            const data = await response.json();
            if (data.success) {
                alert("OTP verified successfully!");
                setOtpVerified(true); // OTP is verified
            } else {
                alert("Invalid OTP. Try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    }

    async function verifyAuth() {
        if (!captchaVerified) {
            alert("Please complete the CAPTCHA");
            return;
        }

        if (!otpVerified) {
            alert("Please verify your OTP before logging in.");
            return;
        }

        setLoading(true); 

        try {
            const response = await fetch(`http://localhost:5000/fetchToken/${userName}`);
            if (!response.ok) throw new Error('Failed to fetch user information');

            const data = await response.json();
            const matchResponse = await fetch(`http://localhost:5000/Compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pEntered: passwordEntered, pFetched: data.password })
            });

            const dataFetched = await matchResponse.json();
            const captchaResponse = await fetch('https://cors-anywhere.herokuapp.com/https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${process.env.REACT_APP_RECAPTCHA_SECRET}&response=${captchaToken}` // Use env variable
            });

            const captchaData = await captchaResponse.json();

            if (dataFetched.status) {
                const responseTokenGenerate = await fetch(`http://localhost:5000/setToken/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const tokenData = await responseTokenGenerate.json();

                localStorage.setItem("LoginToken", tokenData.insertedId);
                localStorage.setItem("LoggedInUserID", data._id);
                nav("/Dashboard");
            } else {
                alert("Invalid Credentials or CAPTCHA verification failed");
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert("Invalid Credentials or server error");
        } finally {
            setLoading(false); // Stop loading
        }
    }

    if (!valid) {
        return (
            <div id="loginContainer">
                <div id="loginBox">
                    <img src={LibImg} alt="Library" id="libImg" />
                    <div id="loginForm">
                        <p className="italicText">Discover, Explore, Imagine</p>
                        <p className="headText">LOGIN</p>
                        <input type="text" placeholder="Email" onChange={(e) => setUserName(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e) => setPasswordEntered(e.target.value)} />
                        
                        {otpSent ? (
                            <>
                                <input type="number" placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
                                <button className="btnLogin" onClick={verifyOtp}>
                                    Verify OTP
                                </button>
                            </>
                        ) : (
                            <button className="btnLogin" onClick={sendOtp}>
                                Send OTP
                            </button>
                        )}
                        
                        <ReCAPTCHA
                            sitekey="6LesgWsqAAAAAAc8DrjlMEoENrobne1aG47wk6eB" 
                            onChange={onCaptchaChange}
                        />
                        
                        <button className="btnLogin" onClick={verifyAuth} disabled={loading || !otpVerified}>
                            {loading ? "Loading..." : "Login"} <i className="fa-solid fa-right-to-bracket"></i>
                        </button>
                        <p>Don't have an Account? <Link to="/SignUp">Sign Up</Link></p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
