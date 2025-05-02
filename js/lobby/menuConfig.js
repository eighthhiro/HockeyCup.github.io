
// js/lobby/menuConfig.js - Configuration for menu options
export const menuConfig = {
    classic: [
        { 
            name: "Bar Game", 
            action: "showLevels", 
            params: { mode: "barGame" },
            levels: [
                { 
                    name: "Lightning Larry", 
                    action: "startGame", 
                    params: { mode: "barGame", level: 1 }, 
                    opponentName: "Lightning Larry", 
                    character: "lightninglarry",
                    img: "./assets/characters/lightninglarry.png"
                },
                { 
                    name: "The Puck Slayer", 
                    action: "startGame", 
                    params: { mode: "barGame", level: 2 }, 
                    opponentName: "The Puck Slayer", 
                    character: "puckslayer",
                    img: "./assets/characters/puckslayer.png"
                },
                { 
                    name: "Defense Dio", 
                    action: "startGame", 
                    params: { mode: "barGame", level: 3 }, 
                    opponentName: "Defense Dio", 
                    character: "defensedio",
                    img: "./assets/characters/defensedio.png"
                }
            ],
            banner: "./assets/banner/bar.png"
        },
        { 
            name: "Arcade", 
            action: "showLevels", 
            params: { mode: "arcade" },
            levels: [
                { 
                    name: "Tiny Tornado", 
                    action: "startGame", 
                    params: { mode: "arcade", level: 1 }, 
                    opponentName: "Tiny Tornado", 
                    character: "tinytornado",
                    img: "./assets/characters/tinytornado.png"
                },
                { 
                    name: "Zippy the Striker", 
                    action: "startGame", 
                    params: { mode: "arcade", level: 2 }, 
                    opponentName: "Zippy the Striker", 
                    character: "zippystriker",
                    img: "./assets/characters/zippystriker.png"
                },
                { 
                    name: "Prince Pucks-a-Lot", 
                    action: "startGame", 
                    params: { mode: "arcade", level: 3 }, 
                    opponentName: "Prince Pucks-a-Lot", 
                    character: "princepucksalot",
                    img: "./assets/characters/princepucksalot.png"
                }
            ],
            banner: "./assets/banner/arcade.png"
        },
        { 
            name: "Tournament", 
            action: "showLevels", 
            params: { mode: "tournament" },
            levels: [
                { 
                    name: "Colin Cummings", 
                    action: "startGame", 
                    params: { mode: "tournament", level: 1 }, 
                    opponentName: "Colin Cummings", 
                    character: "colincummings",
                    img: "./assets/characters/colincummings.png"
                },
                { 
                    name: "Jacob Weissman", 
                    action: "startGame", 
                    params: { mode: "tournament", level: 2 }, 
                    opponentName: "Jacob Weissman", 
                    character: "jacobweissman",
                    img: "./assets/characters/jacobweissman.png"
                },
                { 
                    name: "Danny Hynes", 
                    action: "startGame", 
                    params: { mode: "tournament", level: 3 }, 
                    opponentName: "Danny Hynes", 
                    character: "dannyhynes",
                    img: "./assets/characters/dannyhynes.png"
                }
            ],
            banner: "./assets/banner/tournament.png"
        },
        { 
            name: "Space", 
            action: "showLevels", 
            params: { mode: "space" },
            levels: [
                { 
                    name: "Lunar", 
                    action: "startGame", 
                    params: { mode: "space", level: 1 }, 
                    opponentName: "Lunar", 
                    character: "lunar",
                    img: "./assets/characters/lunar.png"
                },
                { 
                    name: "Mars", 
                    action: "startGame", 
                    params: { mode: "space", level: 2 }, 
                    opponentName: "Mars", 
                    character: "mars",
                    img: "./assets/characters/mars.png"
                },
                { 
                    name: "Zero-G", 
                    action: "startGame", 
                    params: { mode: "space", level: 3 }, 
                    opponentName: "Zero-G", 
                    character: "zerog",
                    img: "./assets/characters/zerog.png"
                }
            ],
            banner: "./assets/banner/space.png"
        }
    ],
    duels: [
        { name: "1 vs 1", action: "startGame", params: { mode: "1v1" } },
        { name: "1 vs AI", action: "showAIDifficulty" }
    ],
    stats: [],
    settings: []
};
