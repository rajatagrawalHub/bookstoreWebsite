import { Link, useNavigate } from "react-router-dom";
import LibImg from "../Assets/libraryImg.jpg"
import NavBar from "../Components/Navabr"
import {useEffect, useState } from "react";
import Dashboard from "./DashboardBookSell";

export default function Login(){
    const[passwordEntered, setpasswordEntered] = useState("");
    const[userName, setUserName] = useState("");
    const[valid, setValid] = useState(false);


    useEffect(()=>{
        async function VerifyToken(){
            const LoginTokenStored =  localStorage.getItem("LoginToken")
            if(LoginTokenStored){
                try {
                    const response = await fetch(`http://localhost:5000/getToken/${LoginTokenStored}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json()
                    if(data.type == "LoginToken" ){
                        setValid(true)
                    }
                } catch (error) {
                    console.error('There was a problem with the auth operation:', error);
                }
            }
        }
        VerifyToken();
    },[])

    async function verifyAuth (){
        try {
            const response = await fetch(`http://localhost:5000/fetchToken/${userName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json()
            if(passwordEntered == data.password){
                const responseTokenGenerate = await fetch(`http://localhost:5000/setToken/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
                const tokendata = await responseTokenGenerate.json();
                localStorage.setItem("LoginToken",(tokendata.insertedId))
                localStorage.setItem("LoggedInUserID",data._id)
                setValid(true)
            }else{
                setValid(false)
                alert("Invalid Credentials")
            }
        } catch (error) {
            console.error('There was a problem with the auth operation:', error);
            setValid(false)
            alert("Invalid Credentials")
        }
    }
    
    const nav = useNavigate();
    useEffect(()=>{
        if(valid){
            nav('/Dashboard')
        }
    },[valid,nav])

    if(!valid){
        return(
            <div id="loginContainer">
                <div id="loginBox">
                    <img src={LibImg} alt="Libraray Image" id="libImg" />
                <div id="loginForm">
                        <p className="italicText">Discover, Explore, Imagine</p>
                        <p className="headText">LOGIN</p>
                        <input type="text" placeholder="Email" onChange={(e)=>setUserName(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e)=>setpasswordEntered(e.target.value)} />
                        <button className="btnLogin" onClick={()=>verifyAuth()}>Login<i className="fa-solid fa-right-to-bracket"></i></button>
                        <button className="btnLogin"><i className="fa-brands fa-google" ></i>Continue With Google</button>
                        <p>Don't have an Account ? <Link to="/SignUp">Sign Up</Link></p>
                        <p>By Continuing, I agree to the <a href="https://https://en.wikipedia.org/wiki/Library.com/Library">Terms of Use & Privacy Pilacy</a></p>
                </div>
                </div>
            </div>
        );
    }

    return null;
}