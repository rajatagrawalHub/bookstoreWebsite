import { Link, useNavigate } from "react-router-dom";
import LibImg from "../Assets/libraryImg.jpg";
import { useEffect, useState } from "react";

export default function Signup() {
    const [passwordEntered, setPasswordEntered] = useState("");
    const [userName, setUserName] = useState("");
    const [fName, setFName] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false); // To track if OTP has been sent
    const [otpVerified, setOtpVerified] = useState(false); // To track OTP verification
    const nav = useNavigate();

    
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

    // Function to verify OTP
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

    async function addUser() {
        if (!otpVerified) {
            alert("Please verify your OTP before signing up.");
            return;
        }
        try {
            const fetchResponse = await fetch(`http://localhost:5000/fetchToken/${userName}`);
            const dataFetched = await fetchResponse.json();
            if (dataFetched) {
                alert("User with this email already exists");
            } else {
                const response = await fetch(`http://localhost:5000/addUser/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userName, password: passwordEntered, fname: fName }),
                });
                const data = await response.json();
                if (data.acknowledged) {
                    alert("User created successfully!");
                    nav("/login");
                }
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    return (
        <div id="loginContainer">
            <div id="loginBox">
                <img src={LibImg} alt="Library Image" id="libImg" />
                <div id="loginForm">
                    <p className="italicText">Discover, Explore, Imagine</p>
                    <p className="headText">SIGNUP</p>
                    <input type="text" placeholder="Email" onChange={(e) => setUserName(e.target.value)} />
                    <button className="btnLogin" onClick={sendOtp} disabled={otpSent}>
                        Send OTP
                    </button>
                    <input type="number" placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
                    <button className="btnLogin" onClick={verifyOtp} disabled={otpVerified}>
                        Verify OTP
                    </button>
                    <input type="password" placeholder="Password" onChange={(e) => setPasswordEntered(e.target.value)} />
                    <input type="text" placeholder="Name" onChange={(e) => setFName(e.target.value)} />
                    <button className="btnLogin" onClick={addUser}>
                        Sign Up<i className="fa-solid fa-right-to-bracket"></i>
                    </button>
                    <p>
                        Already have an Account? <Link to="/login">Sign In</Link>
                    </p>
                    <p>
                        By Continuing, I agree to the <a href="https://en.wikipedia.org/wiki/Library">Terms of Use & Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
