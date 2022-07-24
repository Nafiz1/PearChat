import React, { useRef, useState } from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import logo from "./assets/logo.png";
import pearVideo from "./assets/share.mp4";

firebase.initializeApp({
    apiKey: "AIzaSyCo2XYizpJeoViHfRmptjU1kV-TthZygaI",
    authDomain: "pearchat-24457.firebaseapp.com",
    projectId: "pearchat-24457",
    storageBucket: "pearchat-24457.appspot.com",
    messagingSenderId: "303927087827",
    appId: "1:303927087827:web:1bc6885a3121234a14ba26",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="bg-mainColor ">
            <header>
                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <div className="flex justify-start items-center flex-col h-screen">
            <div className="relative w-full h-full">
                <video
                    src={pearVideo}
                    type="video/mp4"
                    loop
                    controls={false}
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                />
                <div className="absolute flex flex-col justify-center items-center top-0 right-0 left-0 bottom-0 bg-blackOverlay">
                    <div className="p-5">
                        <img src={logo} alt="Pear logo" width="230em" />
                    </div>
                    <div className="p-1">
                        <button
                            type="button"
                            className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
                            onClick={signInWithGoogle}
                        >
                            <svg
                                class="mr-2 -ml-1 w-4 h-4"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fab"
                                data-icon="google"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 488 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                ></path>
                            </svg>
                            Sign in with Google
                        </button>
                    </div>
                    <h1 className="text-lg font-normal leading-normal text-primary">
                        A place to talk about pears.
                    </h1>
                </div>
            </div>
        </div>
    );
}

function SignOut() {
    return (
        auth.currentUser && (
            <div className="fixed inset-x-0 top-0 bg-header p-5 flex justify-between rounded-b-[30px] mb-5">
                <img src={logo} alt="Pear logo" width="200em" />
                <button
                    onClick={() => auth.signOut()}
                    type="button"
                    class="font-normal text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg text-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                    Sign out
                </button>
            </div>
        )
    );
}

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limitToLast(25);

    const [messages] = useCollectionData(query, { idField: "id" });

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="">
            <main className="pt-36 pb-40 h-full scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-100">
                <div className="pb-2">
                    {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

                    <span ref={dummy}></span>
                </div>
                <div className="fixed inset-x-0 bottom-0 bg-header h-32 flex justify-center items-end rounded-t-[30px]">
                    <p className="p-3 text-lg font-normal leading-normal text-primary">
                        © 2022 | Nafiz
                    </p>
                </div>
            </main>

            <form onSubmit={sendMessage}>
                <div className="fixed inset-x-0 mb-4 bottom-12 h-12 flex justify-center">
                    <input
                        class="w-2/3 mr-2 pr-3 pl-4 py-2 placeholder-gray-500 text-black rounded-l-2xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        placeholder="Say something nice"
                        maxlength="1000"
                    />

                    <button
                        className="flex items-center px-4 text-lg text-white bg-greenOverlay rounded-r-lg hover:bg-greenOverlay2 focus:bg-greenOverlay3"
                        type="submit"
                        disabled={!formValue}
                    >
                        Enter
                    </button>
                </div>
            </form>
        </div>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass =
        uid === auth.currentUser.uid
            ? "flex-row-reverse text-right ml-auto bg-greenOverlay p-2"
            : "mr-auto justify-start bg-[#e5e5ea] p-2";

    const imgProp = uid === auth.currentUser.uid ? "ml-3" : "mr-3";

    return (
        <div className="w-full p-1 lg:p-2">
            <div className={`flex items-center ${messageClass} w-fit rounded-lg`}>
                <img
                    className={`rounded-full h-12 ${imgProp}`}
                    src={photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"}
                />
                <p className="max-w-xs lg:max-w-4xl text-base break-words">{text}</p>
            </div>
        </div>
    );
}

export default App;
