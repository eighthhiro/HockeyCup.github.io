// js/lobby/menuConfig.js - Configuration for menu options
export const menuConfig = {
    classic: [
        { 
            name: "Bar Game", 
            action: "showLevels", 
            params: { mode: "barGame" },
            levels: [
                { name: "Lightning Larry", action: "startGame", params: { mode: "barGame", level: 1 } },
                { name: "The Puck Slayer", action: "startGame", params: { mode: "barGame", level: 2 } },
                { name: "Defense Dio", action: "startGame", params: { mode: "barGame", level: 3 } }
            ],
            banner: "./assets/banner/bar.png"
        },
        { 
            name: "Arcade", 
            action: "showLevels", 
            params: { mode: "arcade" },
            levels: [
                { name: "Tiny Tornado", action: "startGame", params: { mode: "arcade", level: 1 } },
                { name: "Zippy the Striker", action: "startGame", params: { mode: "arcade", level: 2 } },
                { name: "Prince Pucks-a-Lot", action: "startGame", params: { mode: "arcade", level: 3 } }
            ],
            banner: "./assets/banner/arcade.png"
        },
        { 
            name: "Tournament", 
            action: "showLevels", 
            params: { mode: "tournament" },
            levels: [
                { name: "Colin Cummings", action: "startGame", params: { mode: "tournament", level: 1 } },
                { name: "Jacob Weissman", action: "startGame", params: { mode: "tournament", level: 2 } },
                { name: "Danny Hynes", action: "startGame", params: { mode: "tournament", level: 3 } }
            ],
            banner: "./assets/banner/tournament.png"
        },
        { 
            name: "Space", 
            action: "showLevels", 
            params: { mode: "space" },
            levels: [
                { name: "Lunar", action: "startGame", params: { mode: "space", level: 1 } },
                { name: "Mars", action: "startGame", params: { mode: "space", level: 2 } },
                { name: "Zero-G", action: "startGame", params: { mode: "space", level: 3 } }
            ],
            banner: "./assets/banner/space.png"
        }
    ],
    duels: [
        { name: "1 vs 1", action: "startGame", params: { mode: "1v1" } },
        { name: "1 vs AI", action: "showAIDifficulty" }
    ],
    stats: [], // Will be handled differently - direct page
    settings: [] // Will be handled differently - direct page
};