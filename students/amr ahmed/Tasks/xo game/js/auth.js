const SUPABASE_URL = "https://rxtltbxofpydthukesin.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UqBYM7pB48fGfvIPvoPO3g_OQkizOzJ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const messageDivCSS = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(15%, -10px);
        }
        to {
            opacity: 1;
            transform: translate(15%, 0);
        }
    }

    #messageDiv {
        position: fixed;

        top: 24px;
        left: 50%;

        width: min(90vw, 420px);
        min-height: 0;

        display: hidden;
        align-items: center;
        justify-content: center;

        padding: 14px 20px;

        background: rgba(10, 15, 30, 0.55);

        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        border: 1px solid rgba(255, 255, 255, 0.14);

        border-radius: 14px;

        box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.45),
            0 0 25px rgba(255, 0, 70, 0.12),
            0 0 25px rgba(0, 140, 255, 0.10);

        z-index: 9999;

        box-sizing: border-box;

        animation: fadeIn 0.4s ease forwards;
    }

    /* =========================
       MOBILE
       ========================= */

@media (max-width: 768px) {
    #messageDiv {
        width: 95vw;
        max-width: 95vw;

        margin-left: -47.5vw;

        top: 16px;

        padding: 13px 18px;
    }

    #message {
        font-size: 14px;
        line-height: 1.5;

        word-break: normal;
        overflow-wrap: break-word;
    }
}

@media (max-width: 400px) {
    #messageDiv {
        width: 94vw;
        max-width: 94vw;

        margin-left: -47vw;

        padding: 12px 15px;
    }

    #message {
        font-size: 13px;
    }
}

    #messageDiv::before {
        content: "";

        position: absolute;

        top: 0;
        left: 15%;
        right: 15%;

        height: 2px;

        border-radius: 999px;

        background: linear-gradient(
            90deg,
            #ff003c,
            #ff315f,
            #008cff
        );

        box-shadow:
            0 0 12px rgba(255, 0, 60, 0.6),
            0 0 15px rgba(0, 140, 255, 0.4);
    }

    #message {
        margin: 0;

        color: rgba(255, 255, 255, 0.9);

        font-size: 14px;
        font-weight: 500;

        line-height: 1.5;

        text-align: center;

        word-break: break-word;
    }
`;

const stylemessageDiv = document.createElement("style");
stylemessageDiv.textContent = messageDivCSS;
document.head.appendChild(stylemessageDiv);


// ============================================================
// AUTH
// ============================================================

async function whenSubmit(e) {
    e.preventDefault();

    const nameInput =
        document.getElementById("name")?.value.trim() || "";

    const emailInput =
        document.getElementById("email")?.value.trim() || "";

    const passwordInput =
        document.getElementById("password")?.value || "";

    const greetingMessage =
        document.getElementById("greeting");

    const messageDiv =
        document.getElementById("messageDiv");

    const messagePlace =
        document.getElementById("message");

    function showMessage(message) {
        if (messageDiv) {
            messageDiv.style.display = "flex";
        }

        if (messagePlace) {
            messagePlace.textContent = message;
        }
    }

    // Detect whether this is Sign Up or Login
    const isRegister =
    greetingMessage?.innerText.trim().toLowerCase() === "create account";



    // ========================================================
    // SIGN UP
    // ========================================================
    console.log("AUTH MODE:", isRegister ? "SIGN UP" : "LOGIN");
console.log("GREETING TEXT:", greetingMessage?.innerText);

    if (isRegister) {

        if (!nameInput) {
            showMessage("Please enter your name.");
            return;
        }

        if (!emailInput) {
            showMessage("Please enter your email.");
            return;
        }

        if (!passwordInput) {
            showMessage("Please enter your password.");
            return;
        }

        if (passwordInput.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        showMessage("Creating your account...");

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({
                email: emailInput,
                password: passwordInput,
                options: {
                    data: {
                        username: nameInput
                    }
                }
            });


            // ------------------------------------------------
            // Sign Up Error
            // ------------------------------------------------

            if (error) {
                console.error("Sign Up error:", error);
                showMessage(error.message);
                return;
            }


            // ------------------------------------------------
            // Make sure Auth user was created
            // ------------------------------------------------

            if (!data || !data.user) {

                console.error(
                    "Supabase Sign Up returned no user:",
                    data
                );

                showMessage(
                    "Account creation failed. No user was created."
                );

                return;
            }


            console.log(
                "Supabase Auth user created:",
                data.user
            );


            // ------------------------------------------------
            // Create player profile
            // ------------------------------------------------

            try {

                await ensurePlayerProfile(
                    data.user,
                    nameInput
                );

                console.log(
                    "Player profile created successfully."
                );

            } catch (profileErr) {

                console.error(
                    "Player profile creation failed:",
                    profileErr
                );

                // Don't stop the registration because
                // the Auth account was already created.
            }


            // ------------------------------------------------
            // Success
            // ------------------------------------------------

            showMessage(
                "Account created successfully!"
            );


            // Go to Login page
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);


            return;

        } catch (err) {

            console.error(
                "Unexpected Sign Up error:",
                err
            );

            showMessage(
                "Something went wrong while creating your account."
            );

            return;
        }
    }



    // ========================================================
    // LOGIN
    // ========================================================

    if (!emailInput) {
        showMessage("Please enter your email.");
        return;
    }

    if (!passwordInput) {
        showMessage("Please enter your password.");
        return;
    }

    showMessage("Logging in...");


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput
        });


        // ------------------------------------------------
        // Login Error
        // ------------------------------------------------

        if (error) {

            console.error(
                "Login error:",
                error
            );

            showMessage(error.message);

            return;
        }


        // ------------------------------------------------
        // Make sure user exists
        // ------------------------------------------------

        if (!data || !data.user) {

            console.error(
                "Login returned no user:",
                data
            );

            showMessage(
                "Login failed. User account was not found."
            );

            return;
        }


        console.log(
            "Logged in user:",
            data.user
        );


        // ------------------------------------------------
        // Ensure player profile exists
        // ------------------------------------------------

        try {

            await ensurePlayerProfile(
                data.user
            );

            console.log(
                "Player profile verified successfully."
            );

        } catch (profileErr) {

            console.error(
                "Error ensuring player profile on login:",
                profileErr
            );

            // Don't prevent login because of profile issues.
        }


        // ------------------------------------------------
        // Login Success
        // ------------------------------------------------

        showMessage(
            "Login successful! Redirecting..."
        );


        setTimeout(() => {
            window.location.href = "xo.html";
        }, 1500);


    } catch (err) {

        console.error(
            "Unexpected Login error:",
            err
        );

        showMessage(
            "Something went wrong while logging in."
        );
    }
}



// ============================================================
// DOM REFERENCES
// ============================================================

const mainContent = document.getElementById("mainContent");
const gameInfo = document.getElementById("gameInfo");
const systemStatus = document.getElementById("systemStatus");

const enterBtn = document.getElementById("enterBtn");
const startScreen = document.getElementById("startScreen");
const characterScreen = document.getElementById("characterScreen");
const playerSetup = document.getElementById("playerSetup");

const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const continueBtn = document.getElementById("continueBtn");
const setupMessage = document.getElementById("setupMessage");

const gameBoard = document.getElementById("gameBoard");
const board = document.getElementById("board");
const boardPlayer1 = document.getElementById("boardPlayer1");
const boardPlayer2 = document.getElementById("boardPlayer2");

const turnText = document.getElementById("turnText");
const turnDot = document.getElementById("turnDot");

const resetGame = document.getElementById("resetGame");
const exitArena = document.getElementById("exitArena");

const winnerOverlay = document.getElementById("winnerOverlay");
const winnerTitle = document.getElementById("winnerTitle");
const winnerName = document.getElementById("winnerName");
const overlayRematch = document.getElementById("overlayRematch");


// ============================================================
// OFFLINE GAME STATE
// ============================================================

let gameState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;


// ============================================================
// ONLINE DOM REFERENCES
// ============================================================

const modeSelect = document.getElementById("modeSelect");
const offlineModeBtn = document.getElementById("offlineModeBtn");
const onlineModeBtn = document.getElementById("onlineModeBtn");
const onlineBackBtn = document.getElementById("onlineBackBtn");

const onlineSetup = document.getElementById("onlineSetup");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const joinRoomCodeInput =
    document.getElementById("joinRoomCodeInput");

const joinRoomCodeSection =
    document.getElementById("joinRoomCodeSection");

const submitRoomCodeBtn =
    document.getElementById("submitRoomCodeBtn");

const onlineSetupMessage =
    document.getElementById("onlineSetupMessage");

const onlineWaitingPanel =
    document.getElementById("onlineWaitingPanel");

const roomCodeDisplay =
    document.getElementById("roomCodeDisplay");

const cancelWaitingBtn =
    document.getElementById("cancelWaitingBtn");

const onlineBoardScreen =
    document.getElementById("onlineBoardScreen");

const onlineBoardEl =
    document.getElementById("onlineBoardEl");

const onlineBoardPlayer1 =
    document.getElementById("onlineBoardPlayer1");

const onlineBoardPlayer2 =
    document.getElementById("onlineBoardPlayer2");

const onlineTurnText =
    document.getElementById("onlineTurnText");

const onlineTurnDot =
    document.getElementById("onlineTurnDot");

const onlineTimer1 =
    document.getElementById("onlineTimer1");

const onlineTimer2 =
    document.getElementById("onlineTimer2");

const onlineStatusMsg =
    document.getElementById("onlineStatusMsg");

const onlineRematchBtn =
    document.getElementById("onlineRematchBtn");

const onlineExitBtn =
    document.getElementById("onlineExitBtn");

const onlineWinnerOverlay =
    document.getElementById("onlineWinnerOverlay");

const onlineWinnerTitle =
    document.getElementById("onlineWinnerTitle");

const onlineWinnerName =
    document.getElementById("onlineWinnerName");

const onlineWinnerReason =
    document.getElementById("onlineWinnerReason");

const onlineOverlayRematch =
    document.getElementById("onlineOverlayRematch");


// Add Exit button on online result overlay dynamically if not present in HTML
if (onlineWinnerOverlay && !document.getElementById("onlineOverlayExit")) {
    const overlayExitBtn = document.createElement("button");
    overlayExitBtn.id = "onlineOverlayExit";
    overlayExitBtn.type = "button";
    overlayExitBtn.className = "mt-4 ml-3 px-10 py-4 border border-gray-700 bg-black/30 text-gray-400 text-xs font-bold tracking-[0.35em] uppercase transition-all duration-300 hover:border-blue-500/60 hover:text-gray-200";
    overlayExitBtn.textContent = "Exit Arena";
    overlayExitBtn.addEventListener("click", exitOnlineGame);

    if (onlineOverlayRematch && onlineOverlayRematch.parentNode) {
        onlineOverlayRematch.after(overlayExitBtn);
    }
}


// ============================================================
// ONLINE GAME STATE
// ============================================================

let onlineGameState = {
    playerId: null,
    playerName: null,

    roomId: null,
    roomCode: null,

    isHost: false,
    mySymbol: null,

    board: ["", "", "", "", "", "", "", "", ""],

    currentTurn: "X",

    playerXId: null,
    playerOId: null,

    playerXName: null,
    playerOName: null,

    playerXTime: 60,
    playerOTime: 60,

    gameStatus: "waiting",

    winner: null,

    turnStartedAt: null,

    realtimeSubscription: null,

    timerInterval: null
};


// ============================================================
// ENSURE & GET CURRENT LOGGED-IN PLAYER
// ============================================================

async function ensurePlayerProfile(user, customName = null) {
    if (!user) return null;

    const { data: existingPlayer, error: fetchError } = await supabaseClient
        .from("players")
        .select("id, userName")
        .eq("id", user.id)
        .maybeSingle();

    if (fetchError) {
        console.error("Player lookup error in ensurePlayerProfile:", fetchError);
    }

    if (existingPlayer) {
        return existingPlayer;
    }

    const userName =
        customName ||
        user.user_metadata?.username ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        (user.email ? user.email.split("@")[0] : null) ||
        "Player";

    console.log(`Creating missing player profile for auth user ${user.id} with userName: ${userName}`);

    const { data: createdPlayer, error: createError } = await supabaseClient
        .from("players")
        .upsert(
            [
                {
                    id: user.id,
                    userName: userName
                }
            ],
            { onConflict: "id" }
        )
        .select("id, userName")
        .maybeSingle();

    if (createError) {
        console.error("Error creating player profile:", createError);
        const { data: reFetchedPlayer } = await supabaseClient
            .from("players")
            .select("id, userName")
            .eq("id", user.id)
            .maybeSingle();

        if (reFetchedPlayer) {
            return reFetchedPlayer;
        }

        throw createError;
    }

    return createdPlayer || { id: user.id, userName: userName };
}

async function getCurrentPlayer() {
    const {
        data: { user },
        error: authError
    } = await supabaseClient.auth.getUser();

    if (authError) {
        throw authError;
    }

    if (!user) {
        throw new Error("You must be logged in.");
    }

    let { data: player, error: playerError } =
        await supabaseClient
            .from("players")
            .select("id, userName")
            .eq("id", user.id)
            .maybeSingle();

    if (playerError) {
        console.error("Player lookup error:", playerError);
        throw playerError;
    }

    if (!player) {
        console.log("No player profile found for auth user:", user.id, "- auto-creating profile...");
        player = await ensurePlayerProfile(user);
    }

    return {
        user,
        player,
        playerId: player.id,
        playerName: player.userName
    };
}


// ============================================================
// WINDOW LOAD
// ============================================================

window.addEventListener("load", function () {

    setTimeout(function () {
        if (mainContent) {
            mainContent.classList.remove(
                "opacity-0",
                "translate-y-8"
            );
        }
    }, 250);

    setTimeout(function () {

        if (gameInfo) {
            gameInfo.classList.remove(
                "opacity-0",
                "-translate-x-8"
            );
        }

        if (systemStatus) {
            systemStatus.classList.remove(
                "opacity-0",
                "translate-x-8"
            );
        }

    }, 600);
});


// ============================================================
// START SCREEN
// ============================================================

if (enterBtn) {

    enterBtn.addEventListener("click", function () {

        startScreen.classList.add(
            "opacity-0",
            "scale-105",
            "transition-all",
            "duration-700"
        );

        setTimeout(function () {

            startScreen.classList.add("hidden");

            characterScreen.classList.remove("hidden");
            characterScreen.classList.add("flex");

        }, 700);
    });
}


// ============================================================
// CHARACTER SCREEN
// ============================================================

if (characterScreen) {

    characterScreen.addEventListener("click", function () {

        characterScreen.classList.add(
            "opacity-0",
            "scale-105",
            "transition-all",
            "duration-700"
        );

        setTimeout(function () {

            characterScreen.classList.add("hidden");

            modeSelect.classList.remove("hidden");
            modeSelect.classList.add("flex");

        }, 700);
    });
}


// ============================================================
// MODE SELECT
// ============================================================

if (offlineModeBtn) {

    offlineModeBtn.addEventListener("click", function () {

        modeSelect.classList.add("hidden");
        modeSelect.classList.remove("flex");

        playerSetup.classList.remove("hidden");
        playerSetup.classList.add("flex");
    });
}


if (onlineModeBtn) {

    onlineModeBtn.addEventListener(
        "click",
        async function () {

            modeSelect.classList.add("hidden");
            modeSelect.classList.remove("flex");

            onlineSetup.classList.remove("hidden");
            onlineSetup.classList.add("flex");

            onlineSetupMessage.classList.add("opacity-0");

            try {

                const {
                    playerId,
                    playerName
                } = await getCurrentPlayer();

                onlineGameState.playerId = playerId;
                onlineGameState.playerName = playerName || "PLAYER";

            } catch (error) {

                console.error(
                    "Could not load current player:",
                    error
                );

                onlineSetupMessage.textContent =
                    error.message ||
                    "Please login first.";

                onlineSetupMessage.classList.remove(
                    "opacity-0"
                );
            }
        }
    );
}


// ============================================================
// ONLINE BACK
// ============================================================

if (onlineBackBtn) {

    onlineBackBtn.addEventListener("click", function () {

        onlineSetup.classList.add("hidden");
        onlineSetup.classList.remove("flex");

        modeSelect.classList.remove("hidden");
        modeSelect.classList.add("flex");

        joinRoomCodeSection.classList.add("hidden");
    });
}


// ============================================================
// OFFLINE CONTINUE
// ============================================================

if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        const name1 =
            player1Name.value.trim();

        const name2 =
            player2Name.value.trim();

        if (name1 === "" || name2 === "") {

            setupMessage.classList.remove(
                "opacity-0"
            );

            return;
        }

        setupMessage.classList.add("opacity-0");

        localStorage.setItem(
            "player1Name",
            name1
        );

        localStorage.setItem(
            "player2Name",
            name2
        );

        localStorage.setItem(
            "player1Symbol",
            "X"
        );

        localStorage.setItem(
            "player2Symbol",
            "O"
        );

        playerSetup.classList.add("hidden");
        playerSetup.classList.remove("flex");

        gameBoard.classList.remove("hidden");
        gameBoard.classList.add("flex");

        loadPlayers();
        createBoard();
    });
}


// ============================================================
// CREATE ONLINE ROOM
// ============================================================

if (createRoomBtn) {

    createRoomBtn.addEventListener(
        "click",
        async function () {

            createRoomBtn.disabled = true;
            createRoomBtn.textContent = "Creating...";

            onlineSetupMessage.classList.add(
                "opacity-0"
            );

            try {

                /*
                    Get the already logged-in player.
                    NO INSERT INTO players.
                */

                const {
                    playerId,
                    playerName
                } = await getCurrentPlayer();

                console.log("Creating room for player ID:", playerId);

                onlineGameState.playerId = playerId;
                onlineGameState.playerName = playerName || "PLAYER";
                onlineGameState.playerXId = playerId;
                onlineGameState.playerXName = playerName || "PLAYER";
                onlineGameState.isHost = true;
                onlineGameState.mySymbol = "X";


                // Generate room code

                const roomCode = generateRoomCode();


                // Create room

                const {
                    data: roomData,
                    error: roomError
                } = await supabaseClient
                    .from("rooms")
                    .insert([
                        {
                            roomCode: roomCode,

                            playerX: playerId,

                            hostId: playerId,

                            playerO: null,

                            board: JSON.stringify([
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                ""
                            ]),

                            currentTurn: "X",

                            playerXTime: 60,

                            playerOTime: 60,

                            turnStartedAt: null,

                            status: "waiting",

                            winner: null
                        }
                    ])
                    .select()
                    .maybeSingle();


                if (roomError) {
                    console.error("Room database error:", roomError);
                    if (roomError) {
                        console.error("Error details:", {
                            code: roomError.code,
                            message: roomError.message,
                            details: roomError.details,
                            hint: roomError.hint
                        });
                    }
                    throw roomError;
                }

                if (!roomData) {
                    throw new Error("Failed to create room.");
                }

                console.log("Created room:", roomData);

                onlineGameState.roomId =
                    roomData.id;

                onlineGameState.roomCode =
                    roomCode;


                // Show waiting panel

                roomCodeDisplay.textContent =
                    roomCode;

                onlineSetup.classList.add("hidden");
                onlineSetup.classList.remove("flex");

                onlineWaitingPanel.classList.remove(
                    "hidden"
                );

                onlineWaitingPanel.classList.add(
                    "flex"
                );


                // Subscribe to room updates
                subscribeToRoom(
                    roomData.id
                );

            } catch (error) {

                console.error(
                    "Error creating room:",
                    error
                );

                onlineSetupMessage.textContent =
                    error.message ||
                    "Error creating room. Try again.";

                onlineSetupMessage.classList.remove(
                    "opacity-0"
                );

                createRoomBtn.disabled = false;
                createRoomBtn.textContent =
                    "Create Room";
            }
        }
    );
}


// ============================================================
// JOIN ROOM BUTTON
// ============================================================

if (joinRoomBtn) {

    joinRoomBtn.addEventListener(
        "click",
        function () {

            joinRoomCodeSection.classList.remove(
                "hidden"
            );
        }
    );
}


// ============================================================
// JOIN ROOM
// ============================================================

if (submitRoomCodeBtn) {

    submitRoomCodeBtn.addEventListener(
        "click",
        async function () {

            const code =
                joinRoomCodeInput.value
                    .trim()
                    .toUpperCase();

            if (code === "") {

                onlineSetupMessage.textContent =
                    "Please enter the room code.";

                onlineSetupMessage.classList.remove(
                    "opacity-0"
                );

                return;
            }


            submitRoomCodeBtn.disabled = true;
            submitRoomCodeBtn.textContent =
                "Joining...";

            onlineSetupMessage.classList.add("opacity-0");


            try {

                /*
                    Get logged-in player.
                    NO INSERT INTO players.
                */

                const {
                    playerId,
                    playerName
                } = await getCurrentPlayer();

                console.log("Current player ID:", playerId);
                console.log("Room code:", code);


                // Find room by code

                const {
                    data: roomData,
                    error: roomError
                } = await supabaseClient
                    .from("rooms")
                    .select("*")
                    .eq("roomCode", code)
                    .maybeSingle();

                console.log("Found room:", roomData);


                if (roomError) {
                    console.error("Room lookup error:", roomError);
                    if (roomError) {
                        console.error("Error details:", {
                            code: roomError.code,
                            message: roomError.message,
                            details: roomError.details,
                            hint: roomError.hint
                        });
                    }
                    throw roomError;
                }

                if (!roomData) {
                    throw new Error(
                        "Room not found."
                    );
                }


                // Check status after fetching
                if (roomData.status !== "waiting") {
                    throw new Error(
                        "Room is not waiting for a player."
                    );
                }


                // Self-join check after fetching
                if (roomData.playerX === playerId) {
                    throw new Error(
                        "You cannot join your own room."
                    );
                }


                // Get Player X name from players table
                let playerXName = "PLAYER 01";
                if (roomData.playerX) {
                    const {
                        data: hostPlayer,
                        error: hostError
                    } = await supabaseClient
                        .from("players")
                        .select("id, userName")
                        .eq("id", roomData.playerX)
                        .maybeSingle();

                    if (hostError) {
                        console.error("Player lookup error:", hostError);
                    }

                    if (hostPlayer && hostPlayer.userName) {
                        playerXName = hostPlayer.userName;
                    }
                }


                // Update room to set playerO and status = playing
                const now = new Date().toISOString();

                const {
                    data: updatedRoom,
                    error: updateError
                } = await supabaseClient
                    .from("rooms")
                    .update({
                        playerO: playerId,
                        status: "playing",
                        currentTurn: "X",
                        playerXTime: 60,
                        playerOTime: 60,
                        turnStartedAt: now
                    })
                    .eq("id", roomData.id)
                    .eq("status", "waiting")
                    .is("playerO", null)
                    .select()
                    .maybeSingle();


                if (updateError) {
                    console.error("Room join update error:", updateError);
                    if (updateError) {
                        console.error("Error details:", {
                            code: updateError.code,
                            message: updateError.message,
                            details: updateError.details,
                            hint: updateError.hint
                        });
                    }
                    throw updateError;
                }

                if (!updatedRoom) {
                    throw new Error("This room is no longer available.");
                }


                onlineGameState.playerId = playerId;
                onlineGameState.playerName = playerName || "PLAYER";
                onlineGameState.isHost = false;
                onlineGameState.mySymbol = "O";
                onlineGameState.roomId = roomData.id;
                onlineGameState.roomCode = code;
                onlineGameState.playerOId = playerId;
                onlineGameState.playerOName = playerName || "PLAYER";
                onlineGameState.playerXId = roomData.playerX;
                onlineGameState.playerXName = playerXName;


                // Show board screen

                onlineSetup.classList.add(
                    "hidden"
                );

                onlineSetup.classList.remove(
                    "flex"
                );

                onlineBoardScreen.classList.remove(
                    "hidden"
                );

                onlineBoardScreen.classList.add(
                    "flex"
                );


                // Subscribe to realtime updates

                subscribeToRoom(
                    roomData.id
                );

                renderOnlineBoard();
                updateOnlineUI();
                startTimerUpdate();


            } catch (error) {

                console.error(
                    "Error joining room:",
                    error
                );

                onlineSetupMessage.textContent =
                    error.message ||
                    "Error joining room. Try again.";

                onlineSetupMessage.classList.remove(
                    "opacity-0"
                );

                submitRoomCodeBtn.disabled = false;

                submitRoomCodeBtn.textContent =
                    "Submit Code";
            }
        }
    );
}


// ============================================================
// CANCEL WAITING
// ============================================================

if (cancelWaitingBtn) {

    cancelWaitingBtn.addEventListener(
        "click",
        async function () {

            if (onlineGameState.roomId) {

                try {

                    const { error: deleteError } = await supabaseClient
                        .from("rooms")
                        .delete()
                        .eq(
                            "id",
                            onlineGameState.roomId
                        );

                    if (deleteError) {
                        console.error("Room database error:", deleteError);
                    }

                } catch (error) {

                    console.error(
                        "Error canceling room:",
                        error
                    );
                }
            }


            resetOnlineState();


            onlineWaitingPanel.classList.add(
                "hidden"
            );

            onlineWaitingPanel.classList.remove(
                "flex"
            );


            onlineSetup.classList.remove(
                "hidden"
            );

            onlineSetup.classList.add(
                "flex"
            );


            joinRoomCodeSection.classList.add(
                "hidden"
            );
        }
    );
}


// ============================================================
// REALTIME SUBSCRIPTION
// ============================================================

function subscribeToRoom(roomId) {

    if (onlineGameState.realtimeSubscription) {

        supabaseClient.removeChannel(
            onlineGameState.realtimeSubscription
        );
    }

    console.log("Subscribing to room:", roomId);

    const subscription =
        supabaseClient
            .channel(`room:${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "rooms",
                    filter: `id=eq.${roomId}`
                },
                async (payload) => {

                    console.log("REALTIME ROOM UPDATE:", payload);

                    if (payload && payload.new) {
                        await handleRoomUpdate(
                            payload.new
                        );
                    }
                }
            )
            .subscribe(async (status) => {
                console.log("Realtime subscription status:", status);
                if (status === "SUBSCRIBED") {
                    await fetchCurrentRoom(roomId);
                }
            });


    onlineGameState.realtimeSubscription =
        subscription;
}


// ============================================================
// FETCH CURRENT ROOM AFTER SUBSCRIBING
// ============================================================

async function fetchCurrentRoom(roomId) {
    try {
        const { data: latestRoom, error } = await supabaseClient
            .from("rooms")
            .select("*")
            .eq("id", roomId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching latest room:", error);
            return;
        }

        if (latestRoom) {
            console.log("Fetched latest room state:", latestRoom);
            await handleRoomUpdate(latestRoom);
        }
    } catch (err) {
        console.error("Error in fetchCurrentRoom:", err);
    }
}


// ============================================================
// HANDLE ROOM UPDATE
// ============================================================

async function handleRoomUpdate(room) {

    if (!room) return;

    console.log("Updated room state:", room);
    console.log("Player O joined:", room.playerO);
    console.log("Current game status:", room.status);
    console.log("Current turn:", room.currentTurn);


    try {

        onlineGameState.roomId = room.id;
        onlineGameState.roomCode = room.roomCode;
        onlineGameState.playerXId = room.playerX;
        onlineGameState.playerOId = room.playerO;
        onlineGameState.currentTurn = room.currentTurn;
        onlineGameState.playerXTime = room.playerXTime;
        onlineGameState.playerOTime = room.playerOTime;
        onlineGameState.gameStatus = room.status;
        onlineGameState.winner = room.winner;
        onlineGameState.turnStartedAt = room.turnStartedAt;

        if (typeof room.board === "string") {
            onlineGameState.board = JSON.parse(room.board || "[]");
        } else {
            onlineGameState.board = room.board || ["", "", "", "", "", "", "", "", ""];
        }


        // Load Player X Name

        if (
            room.playerX &&
            (!onlineGameState.playerXName || onlineGameState.playerXId !== room.playerX)
        ) {

            const {
                data,
                error: playerError
            } = await supabaseClient
                .from("players")
                .select("id, userName")
                .eq(
                    "id",
                    room.playerX
                )
                .maybeSingle();

            if (playerError) {
                console.error("Player lookup error:", playerError);
            }

            if (data && data.userName) {
                onlineGameState.playerXName =
                    data.userName;
            }
        }


        // Load Player O Name

        if (
            room.playerO &&
            (!onlineGameState.playerOName || onlineGameState.playerOId !== room.playerO)
        ) {

            const {
                data,
                error: playerError
            } = await supabaseClient
                .from("players")
                .select("id, userName")
                .eq(
                    "id",
                    room.playerO
                )
                .maybeSingle();

            if (playerError) {
                console.error("Player lookup error:", playerError);
            }

            if (data && data.userName) {
                onlineGameState.playerOName =
                    data.userName;
            }
        }


        // Synchronized Rematch status handling (when room.status is "rematch_X" or "rematch_O")
        if (room.status === "rematch_X" || room.status === "rematch_O") {
            console.log("ROOM UPDATE: Rematch requested status =", room.status);

            const requesterSymbol = room.status === "rematch_X" ? "X" : "O";

            if (onlineGameState.mySymbol === requesterSymbol) {
                if (onlineWinnerReason) {
                    onlineWinnerReason.textContent = "REMATCH REQUESTED · WAITING FOR OPPONENT...";
                }
                const overlayRematchBtn = document.getElementById("onlineOverlayRematch");
                if (overlayRematchBtn) {
                    overlayRematchBtn.disabled = true;
                    overlayRematchBtn.textContent = "WAITING...";
                }
                if (onlineRematchBtn) {
                    onlineRematchBtn.disabled = true;
                    onlineRematchBtn.textContent = "WAITING...";
                }
            } else {
                if (onlineWinnerReason) {
                    onlineWinnerReason.textContent = "OPPONENT REQUESTED A REMATCH!";
                }
                const overlayRematchBtn = document.getElementById("onlineOverlayRematch");
                if (overlayRematchBtn) {
                    overlayRematchBtn.disabled = false;
                    overlayRematchBtn.textContent = "ACCEPT REMATCH";
                }
                if (onlineRematchBtn) {
                    onlineRematchBtn.disabled = false;
                    onlineRematchBtn.textContent = "ACCEPT REMATCH";
                }
            }
        }


        // Screen Transition: Automatically move from waiting/setup to board when playerO joins or status is playing

        if (
            room.playerO &&
            (room.status === "playing" || (room.status === "finished" && room.winner === null))
        ) {

            // Reset rematch buttons state
            const overlayRematchBtn = document.getElementById("onlineOverlayRematch");
            if (overlayRematchBtn) {
                overlayRematchBtn.disabled = false;
                overlayRematchBtn.textContent = "REMATCH";
            }
            if (onlineRematchBtn) {
                onlineRematchBtn.disabled = false;
                onlineRematchBtn.textContent = "REMATCH";
            }

            if (
                onlineWinnerOverlay &&
                !onlineWinnerOverlay.classList.contains("hidden")
            ) {
                onlineWinnerOverlay.classList.add("hidden");
                onlineWinnerOverlay.classList.remove("flex");
            }

            if (
                onlineWaitingPanel &&
                !onlineWaitingPanel.classList.contains("hidden")
            ) {
                onlineWaitingPanel.classList.add("hidden");
                onlineWaitingPanel.classList.remove("flex");
            }

            if (
                onlineSetup &&
                !onlineSetup.classList.contains("hidden")
            ) {
                onlineSetup.classList.add("hidden");
                onlineSetup.classList.remove("flex");
            }

            if (
                onlineBoardScreen &&
                onlineBoardScreen.classList.contains("hidden")
            ) {
                onlineBoardScreen.classList.remove("hidden");
                onlineBoardScreen.classList.add("flex");
            }

            renderOnlineBoard();
            updateOnlineUI();
            startTimerUpdate();
        }


        // Playing State (mid-game updates)
        if (room.status === "playing") {
            renderOnlineBoard();
            updateOnlineUI();
            startTimerUpdate();
        }


        // Finished State

        if (
            room.status === "finished"
        ) {

            clearInterval(
                onlineGameState.timerInterval
            );

            onlineGameState.gameStatus = "finished";
            onlineGameState.winner = room.winner;

            renderOnlineBoard();
            updateOnlineUI();
            showOnlineGameResult();
        }

    } catch (error) {

        console.error(
            "Error handling room update:",
            error
        );
    }
}


// ============================================================
// ONLINE BOARD
// ============================================================

function renderOnlineBoard() {

    if (
        onlineBoardEl.children.length === 0
    ) {

        for (let i = 0; i < 9; i++) {

            const cell =
                document.createElement("button");

            cell.type = "button";

            cell.dataset.index = i;

            cell.className = `
                border border-white/[0.15]
                bg-black/40
                backdrop-blur-sm
                text-5xl md:text-6xl
                font-black
                transition-all duration-200
                hover:bg-white/[0.05]
                hover:border-white/30
                disabled:cursor-not-allowed
            `;

            cell.addEventListener(
                "click",
                () => onlineCellClick(i)
            );

            onlineBoardEl.appendChild(cell);
        }
    }


    onlineGameState.board.forEach(
        (symbol, index) => {

            const cell =
                onlineBoardEl.children[index];

            if (!cell) return;

            cell.textContent = symbol;

            cell.disabled =
                symbol !== "" ||
                onlineGameState.gameStatus !==
                    "playing" ||
                onlineGameState.currentTurn !==
                    onlineGameState.mySymbol;


            cell.className = `
                border bg-black/40
                backdrop-blur-sm
                text-5xl md:text-6xl
                font-black
                transition-all duration-200
                disabled:cursor-not-allowed
            `;


            if (symbol === "X") {

                cell.classList.add(
                    "text-red-600",
                    "border-red-600/30",
                    "drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                );

            } else if (symbol === "O") {

                cell.classList.add(
                    "text-blue-500",
                    "border-blue-500/30",
                    "drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                );

            } else {

                cell.classList.add(
                    "border-white/[0.15]",
                    "hover:bg-white/[0.05]",
                    "hover:border-white/30"
                );
            }
        }
    );
}


// ============================================================
// ONLINE UI
// ============================================================

function updateOnlineUI() {

    onlineBoardPlayer1.textContent =
        onlineGameState.playerXName ||
        "PLAYER 01";

    onlineBoardPlayer2.textContent =
        onlineGameState.playerOName ||
        "PLAYER 02";


    if (
        onlineGameState.currentTurn === "X"
    ) {

        onlineTurnText.textContent =
            "X'S TURN";

        onlineTurnText.className =
            "text-[9px] md:text-xs font-bold tracking-[0.25em] text-red-400 uppercase whitespace-nowrap";

        onlineTurnDot.className =
            "w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_15px_rgba(168,85,247,1)] animate-pulse";

    } else {

        onlineTurnText.textContent =
            "O'S TURN";

        onlineTurnText.className =
            "text-[9px] md:text-xs font-bold tracking-[0.25em] text-blue-400 uppercase whitespace-nowrap";

        onlineTurnDot.className =
            "w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse";
    }


    onlineStatusMsg.textContent =
        onlineGameState.currentTurn ===
        onlineGameState.mySymbol
            ? "YOUR MOVE"
            : "WAITING...";


    updateOnlineTimerDisplay();
}


// ============================================================
// TIMER
// ============================================================

function startTimerUpdate() {

    clearInterval(
        onlineGameState.timerInterval
    );


    onlineGameState.timerInterval =
        setInterval(() => {

            updateOnlineTimerDisplay();

        }, 100);
}


function updateOnlineTimerDisplay() {

    const now = Date.now();

    const turnStartedAtTime =
        onlineGameState.turnStartedAt
            ? new Date(
                onlineGameState.turnStartedAt
            ).getTime()
            : now;


    const elapsedMs =
        now - turnStartedAtTime;


    let displayXTime =
        onlineGameState.playerXTime;

    let displayOTime =
        onlineGameState.playerOTime;


    if (
        onlineGameState.currentTurn ===
        "X"
    ) {

        displayXTime =
            Math.max(
                0,
                onlineGameState.playerXTime -
                Math.floor(
                    elapsedMs / 1000
                )
            );

    } else {

        displayOTime =
            Math.max(
                0,
                onlineGameState.playerOTime -
                Math.floor(
                    elapsedMs / 1000
                )
            );
    }


    onlineTimer1.textContent =
        formatTime(displayXTime);

    onlineTimer2.textContent =
        formatTime(displayOTime);


    onlineTimer1.classList.toggle(
        "text-red-500",
        displayXTime <= 10 &&
        onlineGameState.currentTurn === "X"
    );


    onlineTimer2.classList.toggle(
        "text-red-500",
        displayOTime <= 10 &&
        onlineGameState.currentTurn === "O"
    );
}


function formatTime(seconds) {

    const mins =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return `${mins}:${secs
        .toString()
        .padStart(2, "0")}`;
}


// ============================================================
// ONLINE CELL CLICK
// ============================================================

async function onlineCellClick(index) {

    if (
        onlineGameState.currentTurn !==
        onlineGameState.mySymbol
    ) {
        return;
    }


    if (
        onlineGameState.gameStatus !==
        "playing"
    ) {
        return;
    }


    if (
        onlineGameState.board[index] !== ""
    ) {
        return;
    }


    try {

        const newBoard = [
            ...onlineGameState.board
        ];

        newBoard[index] =
            onlineGameState.mySymbol;


        // Optimistically apply and render move immediately on local board
        onlineGameState.board = newBoard;
        renderOnlineBoard();


        const nextTurn =
            onlineGameState.mySymbol === "X"
                ? "O"
                : "X";


        const now =
            new Date().toISOString();


        const result =
            checkWinner(newBoard);


        if (result) {
            onlineGameState.gameStatus = "finished";
            onlineGameState.winner =
                result.winner === "draw"
                    ? "draw"
                    : (result.winner === "X"
                        ? onlineGameState.playerXId
                        : onlineGameState.playerOId);

            renderOnlineBoard();
            updateOnlineUI();
            showOnlineGameResult();
        }


        const {
            error
        } = await supabaseClient
            .from("rooms")
            .update({

                board:
                    JSON.stringify(newBoard),

                currentTurn:
                    result
                        ? "X"
                        : nextTurn,

                turnStartedAt:
                    result
                        ? onlineGameState.turnStartedAt
                        : now,

                status:
                    result
                        ? "finished"
                        : "playing",

                winner:
                    result
                        ? (
                            result.winner ===
                            "draw"
                                ? "draw"
                                : (
                                    result.winner ===
                                    "X"
                                        ? onlineGameState.playerXId
                                        : onlineGameState.playerOId
                                )
                        )
                        : null

            })
            .eq(
                "id",
                onlineGameState.roomId
            );


        if (error) {
            console.error("Room database error:", error);
            if (error) {
                console.error("Error details:", {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
            }
            throw error;
        }

    } catch (error) {

        console.error(
            "Error making move:",
            error
        );
    }
}


// ============================================================
// CHECK WINNER
// ============================================================

function checkWinner(board) {

    const lines = [

        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]

    ];


    for (let line of lines) {

        const [a, b, c] = line;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            return {
                winner: board[a],
                pattern: line
            };
        }
    }


    if (
        board.every(
            cell => cell !== ""
        )
    ) {

        return {
            winner: "draw",
            pattern: null
        };
    }


    return null;
}


// ============================================================
// ONLINE RESULT
// ============================================================

function showOnlineGameResult() {

    const result =
        checkWinner(
            onlineGameState.board
        );

    // 1. Check if the latest move created a winner (3-in-a-row)
    if (result && (result.winner === "X" || result.winner === "O")) {

        const isXWinner =
            result.winner === "X";

        const winnerName =
            isXWinner
                ? onlineGameState.playerXName
                : onlineGameState.playerOName;


        onlineWinnerTitle.textContent =
            result.winner;


        onlineWinnerTitle.className =
            isXWinner
                ? "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-red-600 drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]"
                : "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.9)]";


        onlineWinnerName.textContent =
            winnerName || "PLAYER";


        onlineWinnerReason.textContent =
            "HAS WON THE ROUND";

    } else if (onlineGameState.winner && onlineGameState.winner !== "draw") {

        const isXWinner =
            onlineGameState.winner === onlineGameState.playerXId;

        const winnerSymbol =
            isXWinner ? "X" : "O";

        const winnerName =
            isXWinner
                ? onlineGameState.playerXName
                : onlineGameState.playerOName;


        onlineWinnerTitle.textContent =
            winnerSymbol;


        onlineWinnerTitle.className =
            isXWinner
                ? "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-red-600 drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]"
                : "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.9)]";


        onlineWinnerName.textContent =
            winnerName || "PLAYER";


        onlineWinnerReason.textContent =
            "HAS WON THE ROUND";

    } else {

        // 2. Otherwise, check for Draw (no winner + board full)
        onlineWinnerTitle.textContent =
            "DRAW";

        onlineWinnerTitle.className =
            "mt-5 text-5xl md:text-8xl font-black tracking-[0.08em] text-white";

        onlineWinnerName.textContent =
            "THE GRID REMAINS UNCLAIMED";

        onlineWinnerReason.textContent =
            "";
    }


    onlineWinnerOverlay.classList.remove(
        "hidden"
    );

    onlineWinnerOverlay.classList.add(
        "flex"
    );
}


// ============================================================
// SYNCHRONIZED REMATCH
// ============================================================

async function requestOnlineRematch() {

    if (!onlineGameState.roomId) return;

    try {
        const mySymbol = onlineGameState.mySymbol; // "X" or "O"
        const currentStatus = onlineGameState.gameStatus;

        console.log("REMATCH REQUEST: player symbol =", mySymbol, "current room status =", currentStatus);

        // If the other player already requested a rematch (status is rematch_X or rematch_O), accept and start match!
        if (
            (currentStatus === "rematch_X" && mySymbol === "O") ||
            (currentStatus === "rematch_O" && mySymbol === "X")
        ) {
            console.log("REMATCH ACCEPTED: Both players agreed to rematch");
            console.log("REMATCH STARTED");

            const now = new Date().toISOString();

            const { error } = await supabaseClient
                .from("rooms")
                .update({
                    board: JSON.stringify([
                        "", "", "",
                        "", "", "",
                        "", "", ""
                    ]),
                    currentTurn: "X",
                    playerXTime: 60,
                    playerOTime: 60,
                    turnStartedAt: now,
                    status: "playing",
                    winner: null
                })
                .eq("id", onlineGameState.roomId);

            if (error) {
                console.error("Room database error starting rematch:", error);
                throw error;
            }

            return;
        }

        // First player to request rematch -> set status to rematch_X or rematch_O
        const newStatus = mySymbol === "X" ? "rematch_X" : "rematch_O";

        console.log("Updating room status for rematch request:", newStatus);

        const { error } = await supabaseClient
            .from("rooms")
            .update({
                status: newStatus
            })
            .eq("id", onlineGameState.roomId);

        if (error) {
            console.error("Error setting rematch status:", error);
            throw error;
        }

        if (onlineWinnerReason) {
            onlineWinnerReason.textContent = "REMATCH REQUESTED · WAITING FOR OPPONENT...";
        }

        const overlayRematchBtn = document.getElementById("onlineOverlayRematch");
        if (overlayRematchBtn) {
            overlayRematchBtn.disabled = true;
            overlayRematchBtn.textContent = "WAITING...";
        }

        if (onlineRematchBtn) {
            onlineRematchBtn.disabled = true;
            onlineRematchBtn.textContent = "WAITING...";
        }

    } catch (error) {
        console.error("Error requesting online rematch:", error);
    }
}


if (onlineRematchBtn) {

    onlineRematchBtn.addEventListener(
        "click",
        requestOnlineRematch
    );
}


if (onlineOverlayRematch) {

    onlineOverlayRematch.addEventListener(
        "click",
        requestOnlineRematch
    );
}


// ============================================================
// EXIT ONLINE ARENA
// ============================================================

function exitOnlineGame() {
    console.log("EXIT ONLINE GAME");

    if (onlineWinnerOverlay) {
        onlineWinnerOverlay.classList.add("hidden");
        onlineWinnerOverlay.classList.remove("flex");
    }

    if (onlineBoardScreen) {
        onlineBoardScreen.classList.add("hidden");
        onlineBoardScreen.classList.remove("flex");
    }

    if (onlineWaitingPanel) {
        onlineWaitingPanel.classList.add("hidden");
        onlineWaitingPanel.classList.remove("flex");
    }

    if (onlineSetup) {
        onlineSetup.classList.add("hidden");
        onlineSetup.classList.remove("flex");
    }

    if (modeSelect) {
        modeSelect.classList.remove("hidden");
        modeSelect.classList.add("flex");
    }

    resetOnlineState();
}


if (onlineExitBtn) {

    onlineExitBtn.addEventListener(
        "click",
        exitOnlineGame
    );
}


// ============================================================
// RESET ONLINE STATE
// ============================================================

function resetOnlineState() {

    clearInterval(
        onlineGameState.timerInterval
    );


    if (
        onlineGameState.realtimeSubscription
    ) {

        supabaseClient.removeChannel(
            onlineGameState.realtimeSubscription
        );
    }


    onlineGameState = {

        playerId: null,

        playerName: null,

        roomId: null,

        roomCode: null,

        isHost: false,

        mySymbol: null,

        board: [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        currentTurn: "X",

        playerXId: null,

        playerOId: null,

        playerXName: null,

        playerOName: null,

        playerXTime: 60,

        playerOTime: 60,

        gameStatus: "waiting",

        winner: null,

        turnStartedAt: null,

        realtimeSubscription: null,

        timerInterval: null
    };


    if (onlineBoardEl) {
        onlineBoardEl.innerHTML = "";
    }

    if (joinRoomCodeInput) {
        joinRoomCodeInput.value = "";
    }

    if (joinRoomCodeSection) {
        joinRoomCodeSection.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// ROOM CODE
// ============================================================

function generateRoomCode() {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        code += chars.charAt(
            Math.floor(
                Math.random() *
                chars.length
            )
        );
    }

    return code;
}


// ============================================================
// OFFLINE GAME
// ============================================================

function loadPlayers() {

    const name1 =
        localStorage.getItem(
            "player1Name"
        ) || "Player 1";

    const name2 =
        localStorage.getItem(
            "player2Name"
        ) || "Player 2";


    boardPlayer1.textContent =
        name1;

    boardPlayer2.textContent =
        name2;
}


function createBoard() {

    gameState = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    currentPlayer = "X";

    gameOver = false;

    board.innerHTML = "";


    for (let i = 0; i < 9; i++) {

        const cell =
            document.createElement(
                "button"
            );

        cell.type = "button";

        cell.className = `
            border border-white/[0.15]
            bg-black/40
            backdrop-blur-sm
            text-5xl
            md:text-6xl
            font-black
            transition-all
            duration-200
            hover:bg-white/[0.05]
            hover:border-white/30
            disabled:cursor-not-allowed
        `;


        cell.addEventListener(
            "click",
            function () {
                makeMove(i);
            }
        );


        board.appendChild(cell);
    }


    updateBoardDisplay();
}


function makeMove(index) {

    if (
        gameState[index] !== "" ||
        gameOver
    ) {
        return;
    }


    gameState[index] =
        currentPlayer;


    updateBoardDisplay();


    const winner =
        checkGame(gameState);


    if (winner) {

        finishGame(winner);

    } else {

        switchTurn();
    }
}


function updateBoardDisplay() {

    const cells =
        board.querySelectorAll(
            "button"
        );


    cells.forEach(
        (cell, index) => {

            cell.textContent =
                gameState[index];


            cell.className = `
                border
                bg-black/40
                backdrop-blur-sm
                text-5xl
                md:text-6xl
                font-black
                transition-all
                duration-200
                disabled:cursor-not-allowed
            `;


            if (
                gameState[index] === "X"
            ) {

                cell.classList.add(
                    "text-red-600",
                    "border-red-600/30",
                    "drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                );

                cell.disabled = true;

            } else if (
                gameState[index] === "O"
            ) {

                cell.classList.add(
                    "text-blue-500",
                    "border-blue-500/30",
                    "drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                );

                cell.disabled = true;

            } else {

                cell.classList.add(
                    "border-white/[0.15]",
                    "hover:bg-white/[0.05]",
                    "hover:border-white/30"
                );

                cell.disabled = false;
            }
        }
    );


    updateTurnDisplay();
}


function switchTurn() {

    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";

    updateTurnDisplay();
}


function updateTurnDisplay() {

    if (
        currentPlayer === "X"
    ) {

        turnText.textContent =
            "X's Turn";

        turnText.className =
            "text-[10px] md:text-xs font-bold tracking-[0.25em] text-red-400 uppercase";

        turnDot.className =
            "mt-2 w-2 h-2 rounded-full bg-red-600 mx-auto shadow-[0_0_15px_rgba(168,85,247,1)] animate-pulse";

    } else {

        turnText.textContent =
            "O's Turn";

        turnText.className =
            "text-[10px] md:text-xs font-bold tracking-[0.25em] text-blue-400 uppercase";

        turnDot.className =
            "mt-2 w-2 h-2 rounded-full bg-blue-500 mx-auto shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse";
    }
}


function checkGame(state) {

    const lines = [

        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]

    ];


    for (let line of lines) {

        const [a, b, c] = line;

        if (
            state[a] &&
            state[a] === state[b] &&
            state[a] === state[c]
        ) {

            return {
                winner: state[a],
                pattern: line
            };
        }
    }


    if (
        state.every(
            cell => cell !== ""
        )
    ) {

        return {
            winner: "draw",
            pattern: null
        };
    }


    return null;
}


function finishGame(result) {

    gameOver = true;


    const cells =
        board.querySelectorAll(
            "button"
        );


    cells.forEach(
        cell => {
            cell.disabled = true;
        }
    );


    if (result.pattern) {

        result.pattern.forEach(
            index => {

                const cell =
                    board.children[index];

                cell.classList.add(
                    "bg-white/[0.08]",
                    "scale-105"
                );


                if (
                    result.winner === "X"
                ) {

                    cell.classList.add(
                        "border-red-600"
                    );

                } else {

                    cell.classList.add(
                        "border-blue-500"
                    );
                }
            }
        );
    }


    if (
        result.winner === "draw"
    ) {

        winnerTitle.textContent =
            "DRAW";

        winnerTitle.className =
            "mt-5 text-5xl md:text-8xl font-black tracking-[0.08em] text-white";

        winnerName.textContent =
            "THE GRID REMAINS UNCLAIMED";

    } else {

        const name =
            result.winner === "X"
                ? boardPlayer1.textContent
                : boardPlayer2.textContent;


        winnerTitle.textContent =
            result.winner;


        winnerTitle.className =
            result.winner === "X"
                ? "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-red-600 drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]"
                : "mt-5 text-6xl md:text-8xl font-black tracking-[0.08em] text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.9)]";


        winnerName.textContent =
            name;
    }


    winnerOverlay.classList.remove(
        "hidden"
    );

    winnerOverlay.classList.add(
        "flex"
    );
}


if (resetGame) {

    resetGame.addEventListener(
        "click",
        function () {

            winnerOverlay.classList.add(
                "hidden"
            );

            winnerOverlay.classList.remove(
                "flex"
            );

            createBoard();
        }
    );
}


if (exitArena) {

    exitArena.addEventListener(
        "click",
        function () {

            gameBoard.classList.add(
                "hidden"
            );

            gameBoard.classList.remove(
                "flex"
            );

            modeSelect.classList.remove(
                "hidden"
            );

            modeSelect.classList.add(
                "flex"
            );
        }
    );
}


if (overlayRematch) {

    overlayRematch.addEventListener(
        "click",
        function () {

            winnerOverlay.classList.add(
                "hidden"
            );

            winnerOverlay.classList.remove(
                "flex"
            );

            createBoard();
        }
    );
}
