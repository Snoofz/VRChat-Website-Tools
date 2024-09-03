// ==UserScript==
// @name         VRChat Website Tools
// @namespace    http://tampermonkey.net/
// @version      2024-01-30
// @description  Idk
// @author       Snoofz
// @match        https://vrchat.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vrchat.com
// @grant        none
// ==/UserScript==

function OpenMainMenu() {
    CallPopup("Heads up!", "This feature is currently being worked on!", 5000);
}

let ws = null;

function getCookie(name) {
    let cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

async function GrabUser() {
    try {
        const response = await fetch("https://vrchat.com/api/1/auth/user", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": `AMP_MKTG_a750df50d1=JTdCJTdE; auth=${getCookie("auth")}; twoFactorAuth=${getCookie("twoFactorAuth")}`,
                "Referer": "https://vrchat.com/home/content/worlds",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

let oldHTML = "";
let displayName = "";
let trustRankColor = "";
let trustRankName = "";

function sendMessage(rankName, rankColor, displayNameTmp, message) {
    const chatLog = document.getElementById("chatLog");

    const messageContainer = document.createElement('div');
    messageContainer.style.marginBottom = "5px";

    const trustRankSpan = document.createElement('span');
    trustRankSpan.style.color = rankColor;
    trustRankSpan.style.fontWeight = 'bold';
    trustRankSpan.textContent = `[${rankName}] `;

    const displayNameSpan = document.createElement('span');
    displayNameSpan.style.color = '#800080';
    displayNameSpan.style.fontWeight = 'bold';
    displayNameSpan.textContent = `${displayNameTmp}: `;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    messageContainer.appendChild(trustRankSpan);
    messageContainer.appendChild(displayNameSpan);
    messageContainer.appendChild(messageSpan);

    chatLog.appendChild(messageContainer);

    chatLog.scrollTop = chatLog.scrollHeight;

    if (chatLog.childNodes.length > 21) {
        chatLog.removeChild(chatLog.firstChild);
    }
}

function closeChatPage() {
    document.body.innerHTML = oldHTML;
}

function DisplayChatPage() {
    oldHTML = document.body.innerHTML;
    editHTML();

    document.getElementById("chatInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {

            let message = document.getElementById("chatInput").value;
            let username = displayName;
            let msg = message;
            let rankName = trustRankName;
            let rankColor = trustRankColor;

            if (msg == "") return;
            if (!msg) return;

            ws.send(JSON.stringify([{
                m: "n",
                t: Date.now(),
                n: [{
                    n: "customChat",
                    v: 0
                }, {
                    n: JSON.stringify({
                        username,
                        msg,
                        rankName,
                        rankColor
                    }),
                    d: 10,
                    v: 20
                }]
            }]));

            sendMessage(trustRankName, trustRankColor, displayName, message);
            document.getElementById("chatInput").value = "";
            messageCount++;

            const chatLog = document.getElementById('chatLog');
            if (messageCount > 24) {
                chatLog.removeChild(chatLog.firstChild);
                messageCount--;
            }
        }
    });
}

let messageCount = 0;

function editHTML() {
    const chatPageHTML = `
    <div class="home-content">
        <div id="chatPage" class="hidden">
            <div id="chatLog" style="width: 1050px; height: 750px; font-size: 20px; text-align: left; vertical-align: middle; line-height: 1.5;" role="note" title="Chat Log" class="css-bpc6lh eu0ztp81"></div>
            <br>
            <div class="mb-2 mb-sm-0 me-0 me-sm-2 flex-grow-1 css-19zxbf7 e1buxcrw2">
                <input type="text" id="chatInput" aria-label="World Filter" placeholder="Type your message..." class=" css-1bcpvc0 e1buxcrw1" value="">
            </div>
        </div>
    </div>
    <script src="script.js"></script>
    `;

    document.querySelector('.home-content').innerHTML = chatPageHTML;
}

var iconMaps = {
    "star": "M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z",
    "world": "M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z",
    "home": "M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z",
    "search": "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z",
    "cogwheel": "M308.5 135.3c7.1-6.3 9.9-16.2 6.2-25c-2.3-5.3-4.8-10.5-7.6-15.5L304 89.4c-3-5-6.3-9.9-9.8-14.6c-5.7-7.6-15.7-10.1-24.7-7.1l-28.2 9.3c-10.7-8.8-23-16-36.2-20.9L199 27.1c-1.9-9.3-9.1-16.7-18.5-17.8C173.9 8.4 167.2 8 160.4 8h-.7c-6.8 0-13.5 .4-20.1 1.2c-9.4 1.1-16.6 8.6-18.5 17.8L115 56.1c-13.3 5-25.5 12.1-36.2 20.9L50.5 67.8c-9-3-19-.5-24.7 7.1c-3.5 4.7-6.8 9.6-9.9 14.6l-3 5.3c-2.8 5-5.3 10.2-7.6 15.6c-3.7 8.7-.9 18.6 6.2 25l22.2 19.8C32.6 161.9 32 168.9 32 176s.6 14.1 1.7 20.9L11.5 216.7c-7.1 6.3-9.9 16.2-6.2 25c2.3 5.3 4.8 10.5 7.6 15.6l3 5.2c3 5.1 6.3 9.9 9.9 14.6c5.7 7.6 15.7 10.1 24.7 7.1l28.2-9.3c10.7 8.8 23 16 36.2 20.9l6.1 29.1c1.9 9.3 9.1 16.7 18.5 17.8c6.7 .8 13.5 1.2 20.4 1.2s13.7-.4 20.4-1.2c9.4-1.1 16.6-8.6 18.5-17.8l6.1-29.1c13.3-5 25.5-12.1 36.2-20.9l28.2 9.3c9 3 19 .5 24.7-7.1c3.5-4.7 6.8-9.5 9.8-14.6l3.1-5.4c2.8-5 5.3-10.2 7.6-15.5c3.7-8.7 .9-18.6-6.2-25l-22.2-19.8c1.1-6.8 1.7-13.8 1.7-20.9s-.6-14.1-1.7-20.9l22.2-19.8zM112 176a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM504.7 500.5c6.3 7.1 16.2 9.9 25 6.2c5.3-2.3 10.5-4.8 15.5-7.6l5.4-3.1c5-3 9.9-6.3 14.6-9.8c7.6-5.7 10.1-15.7 7.1-24.7l-9.3-28.2c8.8-10.7 16-23 20.9-36.2l29.1-6.1c9.3-1.9 16.7-9.1 17.8-18.5c.8-6.7 1.2-13.5 1.2-20.4s-.4-13.7-1.2-20.4c-1.1-9.4-8.6-16.6-17.8-18.5L583.9 307c-5-13.3-12.1-25.5-20.9-36.2l9.3-28.2c3-9 .5-19-7.1-24.7c-4.7-3.5-9.6-6.8-14.6-9.9l-5.3-3c-5-2.8-10.2-5.3-15.6-7.6c-8.7-3.7-18.6-.9-25 6.2l-19.8 22.2c-6.8-1.1-13.8-1.7-20.9-1.7s-14.1 .6-20.9 1.7l-19.8-22.2c-6.3-7.1-16.2-9.9-25-6.2c-5.3 2.3-10.5 4.8-15.6 7.6l-5.2 3c-5.1 3-9.9 6.3-14.6 9.9c-7.6 5.7-10.1 15.7-7.1 24.7l9.3 28.2c-8.8 10.7-16 23-20.9 36.2L315.1 313c-9.3 1.9-16.7 9.1-17.8 18.5c-.8 6.7-1.2 13.5-1.2 20.4s.4 13.7 1.2 20.4c1.1 9.4 8.6 16.6 17.8 18.5l29.1 6.1c5 13.3 12.1 25.5 20.9 36.2l-9.3 28.2c-3 9-.5 19 7.1 24.7c4.7 3.5 9.5 6.8 14.6 9.8l5.4 3.1c5 2.8 10.2 5.3 15.5 7.6c8.7 3.7 18.6 .9 25-6.2l19.8-22.2c6.8 1.1 13.8 1.7 20.9 1.7s14.1-.6 20.9-1.7l19.8 22.2zM464 304a48 48 0 1 1 0 96 48 48 0 1 1 0-96z",
    "shield": "M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z",
    "envelope": "M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
}

async function waitForURL() {
    if (window.location.href === "https://vrchat.com/home?utm-source=hello-login" ||
        window.location.href.includes("https://vrchat.com/home")) {
        setTimeout(async () => {
            AddButtonToSideBar("Useful Functions", OpenMainMenu, "star");
            AddButtonToSideBar("Custom Live Chat", DisplayChatPage, "envelope");
            AddButtonToSideBar("Avatar Search", OpenMainMenu, "search");
            AddButtonToSideBar("Exploit Tools", OpenMainMenu, "cogwheel");
            AddButtonToSideBar("Website Config", OpenMainMenu, "cogwheel");
            AddButtonToSideBar("Moderation", OpenMainMenu, "shield");

            ws = new WebSocket('wss://piano.ourworldofpixels.com');
            ws.addEventListener("open", (e) => {
                ws.send(JSON.stringify([{
                    "m": "hi"
                }]));
            });

            ws.addEventListener("message", (e) => {
                try {
                    if (JSON.parse(e.data)[0].m == "hi") {
                        ws.send(JSON.stringify([{
                            m: "ch",
                            _id: "balls",
                            set: undefined
                        }]));
                        console.log("Connected to chat server");
                        setInterval(() => {
                            ws.send(JSON.stringify([{
                                "m": "m",
                                "x": Math.floor(Math.random() * 100),
                                "y": Math.floor(Math.random() * 100)
                            }]));
                        }, 1);
                        ws.send(JSON.stringify([{
                            m: "t",
                            e: Date.now()
                        }]));
                        setInterval(() => {
                            ws.send(JSON.stringify([{
                                m: "t",
                                e: Date.now()
                            }]));
                        }, 20000);
                    }
                    let data = JSON.parse(e.data)[0];
                    if (data.m == "n") {
                        console.log(data);
                        if (data.n[0].n == "customChat") {
                            data = JSON.parse(data.n[1].n);

                            let username = data.username;
                            let msg = data.msg;
                            let rankName = data.rankName;
                            let rankColor = data.rankColor;

                            if (msg == "") return;
                            if (!msg) return;

                            sendMessage(rankName, rankColor, username, msg);
                            messageCount++;

                            const chatLog = document.getElementById('chatLog');
                            if (messageCount > 24) {
                                chatLog.removeChild(chatLog.firstChild);
                                messageCount--;
                            }
                        }
                    }
                } catch (e) {

                }
            });

            let res = await GrabUser();
            console.log(res);
            const username = res['displayName'];
            const tags = res['tags'];
            displayName = username;

            tags.forEach(tag => {
                if (tag.toString().includes("admin_moderator")) {
                    trustRankColor = "#FF0000";
                    trustRankName = "Administrator";
                    return;
                }

                if (tags.toString().includes("system_trust_veteran") && tags.toString().includes("system_trust_trusted")) {
                    trustRankColor = "#800080";
                    trustRankName = "Trusted";
                    return;
                }

                if (tags.toString().includes("system_trust_trusted") && tags.toString().includes("system_trust_known") && !tags.toString().includes("system_trust_basic")) {
                    trustRankColor = "#FFD700";
                    trustRankName = "Known";
                    return;
                }

                if (tags.toString().includes("system_trust_basic") && tags.toString().includes("system_trust_known")) {
                    trustRankColor = "#90EE90";
                    trustRankName = "User";
                    return;
                }

                if (tags.toString().includes("system_trust_basic")) {
                    trustRankColor = "#ADD8E6";
                    trustRankName = "New User";
                    return;
                }

                trustRankColor = " #F5F5F5";
                trustRankName = "Visitor";
            });

            console.log(trustRankColor);

        }, 2000);
    } else {

    }
}

function WaitForAviPage() {
    if (window.location.href === "https://vrchat.com/home/avatars" ||
        window.location.href.includes("https://vrchat.com/home/avatars")) {
        setTimeout(() => {
            replaceText();
            addAvatarToPage("gubr", "gubr", "gubr", "gubr", "gubr");
        }, 3000);
    } else {
        setTimeout(WaitForAviPage, 5000);
    }
}

WaitForAviPage();

waitForURL();

function OpenPage() {

    var elementToDelete = document.querySelector('.center-block');

    if (elementToDelete) {

        elementToDelete.remove();
    } else {
        console.log("Element with class 'center-block' not found.");
    }
}

function AddButtonToSideBar(buttonName, func, icon) {

    var newButton = document.createElement("a");

    newButton.setAttribute("title", "Custom Button");
    newButton.setAttribute("class", "btn text-left css-yjay0l e18dqzxk3");
    newButton.setAttribute("href", "#");

    newButton.addEventListener("click", function(event) {
        event.preventDefault();

        func();
    });

    var svgUpload = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgUpload.setAttribute("aria-hidden", "true");
    svgUpload.setAttribute("focusable", "false");
    svgUpload.setAttribute("data-prefix", "fas");
    svgUpload.setAttribute("data-icon", icon);
    svgUpload.setAttribute("class", "svg-inline--fa fa-star css-1efeorg e9fqopp0");
    svgUpload.setAttribute("role", "presentation");
    svgUpload.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgUpload.setAttribute("viewBox", "0 0 512 512");

    var pathUpload = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathUpload.setAttribute("fill", "currentColor");
    pathUpload.setAttribute("d", iconMaps[icon]);

    svgUpload.appendChild(pathUpload);

    var svgAngleRight = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgAngleRight.setAttribute("aria-hidden", "true");
    svgAngleRight.setAttribute("focusable", "false");
    svgAngleRight.setAttribute("data-prefix", "fas");
    svgAngleRight.setAttribute("data-icon", icon);
    svgAngleRight.setAttribute("class", "svg-inline--fa fa-angle-right css-1efeorg e9fqopp0");
    svgAngleRight.setAttribute("role", "presentation");
    svgAngleRight.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgAngleRight.setAttribute("viewBox", "0 0 320 512");

    var pathAngleRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathAngleRight.setAttribute("fill", "currentColor");
    pathAngleRight.setAttribute("d", "M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z");

    svgAngleRight.appendChild(pathAngleRight);

    var divText = document.createElement("div");
    divText.textContent = buttonName;

    newButton.appendChild(svgUpload);
    newButton.appendChild(divText);
    newButton.appendChild(svgAngleRight);

    var referenceNode = document.querySelector(".w-100.css-1bfow8s.btn-group-lg.btn-group-vertical").firstChild;

    referenceNode.parentNode.insertBefore(newButton, referenceNode);
}

function CallPopup(title, text, delay) {

    var toastContainer = document.createElement("div");
    toastContainer.classList.add("text-white", "animated", "fadeIn", "css-hvuvdz", "ehlx1tk2", "toast", "fade", "show");
    toastContainer.setAttribute("role", "alert");
    toastContainer.setAttribute("aria-label", title);

    var toastHeader = document.createElement("div");
    toastHeader.classList.add("css-1o09fqq", "ehlx1tk1", "toast-header");
    toastHeader.style.backgroundColor = "rgba(var(--bs-success-rgb), 0.5)";

    var svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("aria-hidden", "true");
    svgIcon.setAttribute("focusable", "false");
    svgIcon.setAttribute("data-prefix", "fas");
    svgIcon.setAttribute("data-icon", "user-astronaut");
    svgIcon.classList.add("svg-inline--fa", "fa-user-astronaut", "css-1fgxn7x", "e9fqopp0");
    svgIcon.setAttribute("role", "presentation");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("viewBox", "0 0 448 512");
    svgIcon.setAttribute("color", "var(--bs-success)");

    var pathIcon = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathIcon.setAttribute("fill", "currentColor");
    pathIcon.setAttribute("d", "M370.7 96.1C346.1 39.5 289.7 0 224 0S101.9 39.5 77.3 96.1C60.9 97.5 48 111.2 48 128v64c0 16.8 12.9 30.5 29.3 31.9C101.9 280.5 158.3 320 224 320s122.1-39.5 146.7-96.1c16.4-1.4 29.3-15.1 29.3-31.9V128c0-16.8-12.9-30.5-29.3-31.9zM336 144v16c0 53-43 96-96 96H208c-53 0-96-43-96-96V144c0-26.5 21.5-48 48-48H288c26.5 0 48 21.5 48 48zM189.3 162.7l-6-21.2c-.9-3.3-3.9-5.5-7.3-5.5s-6.4 2.2-7.3 5.5l-6 21.2-21.2 6c-3.3 .9-5.5 3.9-5.5 7.3s2.2 6.4 5.5 7.3l21.2 6 6 21.2c.9 3.3 3.9 5.5 7.3 5.5s6.4-2.2 7.3-5.5l6-21.2 21.2-6c3.3-.9 5.5-3.9 5.5-7.3s-2.2-6.4-5.5-7.3l-21.2-6zM112.7 316.5C46.7 342.6 0 407 0 482.3C0 498.7 13.3 512 29.7 512H128V448c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64l98.3 0c16.4 0 29.7-13.3 29.7-29.7c0-75.3-46.7-139.7-112.7-165.8C303.9 338.8 265.5 352 224 352s-79.9-13.2-111.3-35.5zM176 448c-8.8 0-16 7.2-16 16v48h32V464c0-8.8-7.2-16-16-16zm96 32a16 16 0 1 0 0-32 16 16 0 1 0 0 32z");

    svgIcon.appendChild(pathIcon);

    var strongTitle = document.createElement("strong");
    strongTitle.classList.add("me-auto", "ms-2");
    strongTitle.textContent = title;

    var closeButton = document.createElement("button");
    closeButton.setAttribute("type", "button");
    closeButton.classList.add("btn-close", "btn-close-white");
    closeButton.setAttribute("aria-label", "Close");

    toastHeader.appendChild(svgIcon);
    toastHeader.appendChild(strongTitle);
    toastHeader.appendChild(closeButton);

    var toastBody = document.createElement("div");
    toastBody.classList.add("css-1cechmu", "ehlx1tk0", "toast-body");
    toastBody.style.backgroundColor = "rgba(var(--bs-success-rgb), 0.5)";
    toastBody.textContent = text;

    toastContainer.appendChild(toastHeader);
    toastContainer.appendChild(toastBody);

    setTimeout(function() {
        document.querySelector(".toast-container").appendChild(toastContainer);
    }, 100);

    if (delay) {
        setTimeout(function() {
            toastContainer.remove();
        }, delay);
    }
}

function replaceText() {
    var elements = document.querySelectorAll('.css-1o3w9m7.col-12');

    for (var i = 1; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
    }

    var buttons = document.querySelectorAll('.btn.btn-primary');

    buttons.forEach(function(button) {
        if (button.textContent.trim() === 'Load More Avatars') {
            button.parentNode.removeChild(button);
        }
    });

    var extraElement = document.querySelector('.author_quest_fallback.system_jam_8a3721bc-9c06-4da8-b5c8-9a0aaa669930.admin_featured_quest.admin_quest_fallback_extended.public.search-container');
    var extraElement2 = document.querySelector('.system_jam_937ebc48-395b-4f09-b13d-e30f3e0ee26c.system_jam_8a3721bc-9c06-4da8-b5c8-9a0aaa669930.author_quest_fallback.admin_featured_quest.admin_quest_fallback_extended.public.search-container');

    if (extraElement) {
        extraElement.remove();
    }

    if (extraElement2) {
        extraElement2.remove();
    }

    addSearchBar();
}

var lastSearchAmount = 0;

function addSearchBar() {

    var lineBreak1 = document.createElement('br');
    var lineBreak2 = document.createElement('br');

    var searchBar = document.createElement('input');
    searchBar.setAttribute('type', 'text');
    searchBar.setAttribute('placeholder', 'Search by avatar name...');
    searchBar.classList.add('form-control');

    var featuredAvatarsHeading = document.querySelector('h3');
    featuredAvatarsHeading.cloneNode();
    featuredAvatarsHeading.parentNode.insertBefore(searchBar, featuredAvatarsHeading);
    featuredAvatarsHeading.parentNode.insertBefore(lineBreak1, featuredAvatarsHeading);
    featuredAvatarsHeading.parentNode.insertBefore(lineBreak2, featuredAvatarsHeading);

    searchBar.addEventListener('keypress', async function(event) {
        if (event.key === 'Enter') {
            var elements = document.querySelectorAll('.css-1o3w9m7.col-12');
            var extraElement = document.querySelector('.author_quest_fallback.system_jam_8a3721bc-9c06-4da8-b5c8-9a0aaa669930.admin_featured_quest.admin_quest_fallback_extended.public.search-container');
            var extraElement2 = document.querySelector('.system_jam_937ebc48-395b-4f09-b13d-e30f3e0ee26c.system_jam_8a3721bc-9c06-4da8-b5c8-9a0aaa669930.author_quest_fallback.admin_featured_quest.admin_quest_fallback_extended.public.search-container');

            if (extraElement) {
                extraElement.remove();
            }

            if (extraElement2) {
                extraElement2.remove();
            }

            for (var i = 0; i < lastSearchAmount; i++) {
                elements[i].parentNode.removeChild(elements[i]);
            }

            let avatars = await fetchAndParseAvatarData(searchBar.value);
            lastSearchAmount = avatars.length;
            JSON.parse(avatars).forEach(avatar => {
                addAvatarToPage(avatar.avatarId, avatar.avatarName, avatar.avatarDescription, avatar.imageUrl, avatar.authorName, "");
                console.log(avatar.avatarId);
            });
        }
    });
}

function addAvatarToPage(avatarID, title, avatarDescription, thumbnailURL, authorName, authorID) {
    var container = document.querySelector('.css-1o3w9m7.col-12');

    var avatarDiv = document.createElement('div');
    avatarDiv.className = 'system_jam_937ebc48-395b-4f09-b13d-e30f3e0ee26c system_jam_8a3721bc-9c06-4da8-b5c8-9a0aaa669930 author_quest_fallback admin_featured_quest admin_quest_fallback_extended public search-container';

    var rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    var col1 = document.createElement('div');
    col1.className = 'col-12 col-md-4';

    var link = document.createElement('a');
    link.href = `/home/avatar/${avatarID}`;

    var img = document.createElement('img');
    img.className = 'w-100';
    img.src = thumbnailURL;
    img.title = title;
    img.alt = title;

    link.appendChild(img);
    col1.appendChild(link);

    var col2 = document.createElement('div');
    col2.className = 'col-12 col-md-5';

    var h4 = document.createElement('h4');
    var avatarLink = document.createElement('a');
    avatarLink.href = `/home/avatar/${avatarID}`;
    avatarLink.textContent = title;
    var small = document.createElement('small');
    small.innerHTML = `— <a href="/home/user/${authorID}">${authorName}</a>`;
    h4.appendChild(avatarLink);
    h4.appendChild(small);

    var p = document.createElement('p');
    p.textContent = avatarDescription;

    col2.appendChild(h4);
    col2.appendChild(p);

    rowDiv.appendChild(col1);
    rowDiv.appendChild(col2);

    avatarDiv.appendChild(rowDiv);

    container.appendChild(avatarDiv);
}

function openPage(buttonOptions, searchBarOptions) {

    var buttonContainer = document.createElement('div');
    buttonContainer.classList.add('mt-2', 'css-1fttcpj', 'e7t0ljh4');

    buttonOptions.forEach((option, index) => {
        Object.entries(option).forEach(([buttonName, func]) => {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('title', buttonName);
            button.classList.add('btn', 'btn-md', 'btn-primary');
            button.textContent = buttonName;
            button.addEventListener('click', func);

            if (index !== 0) {
                button.style.marginLeft = '10px';
            }
            buttonContainer.appendChild(button);
        });
    });

    document.querySelector('.home-content').appendChild(buttonContainer);

    var searchBarContainer = document.createElement('div');
    searchBarContainer.classList.add('mt-2', 'css-1fttcpj', 'e7t0ljh4');

    searchBarOptions.forEach(option => {
        Object.entries(option).forEach(([searchBarName, func]) => {
            var searchBar = document.createElement('input');
            searchBar.setAttribute('type', 'text');
            searchBar.setAttribute('aria-label', searchBarName);
            searchBar.setAttribute('placeholder', 'Search Your Worlds');
            searchBar.classList.add('css-1v88v7p', 'e1buxcrw1');
            searchBar.addEventListener('input', func);
            searchBarContainer.appendChild(searchBar);
        });
    });

    document.querySelector('.home-content').appendChild(searchBarContainer);
}

async function fetchAndParseAvatarData(searchName) {
    try {
        const url = 'https://corsproxy.io/?' + encodeURIComponent('https://github.com/Snoofz/Snowly-VRC-Tools/raw/main/JxLN772OoP.json');
        const response = await fetch(url);
        const data = await response.json();

        const filteredAvatars = data.filter(avatar =>
            avatar.avatarName.toLowerCase().includes(searchName.toLowerCase())
        );

        const avatarData = filteredAvatars.map(avatar => ({
            imageUrl: avatar.thumbnailUrl,
            avatarName: avatar.avatarName,
            avatarId: avatar.avatarId,
            avatarDescription: `Wearer: ${avatar.wearer}, Stealer: ${avatar.stealer}`,
            vrcaUrl: avatar.vrca,
            authorName: avatar.authorName
        }));

        return JSON.stringify(avatarData, null, 2);
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}

function parseHTMLToJSON(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const results = [];

    const avatarCards = doc.querySelectorAll('.card-dark');
    avatarCards.forEach(card => {
        const name = card.querySelector('.card-text').textContent.trim();
        const description = card.querySelector('.card-text.text-break').textContent.trim();
        const id = card.querySelector('.card-text.text-muted').textContent.trim();
        const author = card.querySelector('.text-muted').nextElementSibling.textContent.trim();
        const thumbnail = card.querySelector('.card-img-top').src;

        const avatar = {
            name: name,
            description: description,
            id: id,
            author: author,
            thumbnail: thumbnail
        };

        results.push(avatar);
    });

    return JSON.stringify(results, null, 2);
}

function fetchUserLocation(username) {
    fetch("https://vrchat.com/api/1/users/usr_afcc65d6-fc6f-4fbd-b1a6-d57db556a7b4", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://vrchat.com/home/user/usr_afcc65d6-fc6f-4fbd-b1a6-d57db556a7b4",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(res => res.json()).then(json => {
        if (json.location == "offline" || json.location == "private") {

        }
    });
}
