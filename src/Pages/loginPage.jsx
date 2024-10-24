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
    const nav = useNavigate();

    useEffect(() => {
        async function VerifyToken() {
            const LoginTokenStored = localStorage.getItem("LoginToken");
            if (!LoginTokenStored) return;

            try {
                const response = await fetch(`http://localhost:5000/getToken/${LoginTokenStored}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data.type === "LoginToken") {
                    setValid(true);
                }
            } catch (error) {
                console.error('There was a problem with the auth operation:', error);
            }
        }
        VerifyToken();
    }, []);

    const onCaptchaChange = (token) => {
        setCaptchaToken(token); 
        setCaptchaVerified(true);
    };

    async function verifyAuth() {
        if (!captchaVerified) {
            alert("Please complete the CAPTCHA");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/fetchToken/${userName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const matchResponse = await fetch(`http://localhost:5000/Compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pEntered: passwordEntered, pFetched: data.password })
            });
            const dataFetched = await matchResponse.json();

            
            const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=YOUR_SECRET_KEY&response=${captchaToken}`
            });
            const captchaData = await captchaResponse.json();

            if (captchaData.success && dataFetched.status == true) {
                const responseTokenGenerate = await fetch(`http://localhost:5000/setToken/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
                const tokendata = await responseTokenGenerate.json();
                localStorage.setItem("LoginToken", tokendata.insertedId);
                localStorage.setItem("LoggedInUserID", data._id);
                nav("/Dashboard");
            } else {
                alert("Invalid Credentials or CAPTCHA verification failed");
            }
        } catch (error) {
            console.error('There was a problem with the auth operation:', error);
            alert("Invalid Credentials");
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
                        
                        <ReCAPTCHA
                            sitekey="6LcX2mkqAAAAACheqHGuKTLEa6apitIeN9JgvCmI"
                            onChange={onCaptchaChange}
                        />

                        <button className="btnLogin" onClick={verifyAuth}>
                            Login<i className="fa-solid fa-right-to-bracket"></i>
                        </button>
                        <p>Don't have an Account ? <Link to="/SignUp">Sign Up</Link></p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
