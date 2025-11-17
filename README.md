# 🏰 Tower Defense - Procedurally Generated

A browser-based tower defense game featuring **procedurally generated levels** that creates unique maps every playthrough. Build strategic tower placements to stop waves of enemies from reaching your base!

## 🎮 Play Now

Play the game live at: [https://yourusername.github.io/tower-defense/](https://yourusername.github.io/tower-defense/)

## ✨ Features

- **Procedural Map Generation**: Every game is unique with randomly generated paths
- **Map Seed System**: Share your favorite maps with friends using seed codes
- **4 Tower Types**: Each with unique abilities and 3 upgrade levels
- **5 Enemy Types**: Including fast units, tanks, flying enemies, and epic bosses
- **20 Progressive Waves**: Increasing difficulty with boss battles every 5 waves
- **Particle Effects**: Explosions, projectile trails, and visual feedback
- **Speed Controls**: Play at 1x, 2x, or 4x speed
- **Save/Load System**: Continue your game later
- **Pure JavaScript**: No dependencies, runs entirely in the browser

## 🎯 How to Play

### Objective
Prevent enemies from reaching your base by building and upgrading towers along the path. You lose if your base health reaches zero!

### Tower Types

| Tower | Cost | Description | Best Use |
|-------|------|-------------|----------|
| **Basic Tower** | $100 | Fast fire rate, balanced damage | General purpose, early game |
| **Sniper Tower** | $150 | High damage, long range, slow fire | Boss enemies, single targets |
| **Splash Tower** | $200 | Area damage, medium range | Groups of enemies at corners |
| **Slow Tower** | $125 | Slows enemies, moderate damage | Support for other towers |

Each tower can be upgraded **3 times**, significantly improving its stats.

### Enemy Types

| Enemy | HP | Speed | Reward | Special |
|-------|-----|-------|--------|---------|
| **Basic** | 50 | Normal | $10 | Standard enemy |
| **Fast** | 30 | Very Fast | $15 | Quick but weak |
| **Tank** | 200 | Slow | $25 | High health |
| **Flying** | 40 | Fast | $20 | Immune to splash damage |
| **Boss** | 1000 | Very Slow | $100 | Appears every 5 waves |

## 🎮 Controls

### Mouse Controls
- **Left Click**: Select tower type, place tower, or select existing tower
- **Hover**: Preview tower range before placement

### Keyboard Shortcuts
- **SPACE**: Start next wave
- **ESC**: Pause/Resume game
- **1**: Set game speed to 1x
- **2**: Set game speed to 2x
- **3** or **4**: Set game speed to 4x

### Tower Management
- **Click Tower**: View stats and upgrade options
- **Upgrade**: Spend money to improve tower stats
- **Sell**: Get 50% of investment back

## 📋 Game Strategy Tips

1. **Early Game**: Focus on Basic Towers with good path coverage
2. **Tower Placement**: Build at corners where enemies slow down
3. **Upgrade First**: Upgrading existing towers is more cost-effective than building new ones
4. **Splash Towers**: Place where enemies bunch up (corners and straightaways)
5. **Slow + Sniper**: Slow towers work great with high-damage towers
6. **Save Money**: Always keep reserve funds for boss waves
7. **Path Coverage**: Ensure enemies are in range for as long as possible

## 🗺️ Map Seeds

The game uses seeded procedural generation, allowing you to share specific maps:

1. **Copy the seed** from the victory/defeat screen
2. **Share with friends** so they can play the same map
3. **Enter seed** on the main menu to replay a specific map

Leave the seed field empty for a random map each time!

## 🛠️ Technical Details

### Technology Stack
- **Pure HTML5 Canvas** for rendering
- **Vanilla JavaScript** (ES6 modules)
- **Web Audio API** for procedural sound effects
- **LocalStorage** for save data
- **No external dependencies**

### Architecture
- **Entity Component System** for game objects
- **A* Pathfinding** for enemy movement
- **Seeded Random Generation** using Mulberry32 algorithm
- **State Management** for game flow
- **Event Bus** for decoupled communication

### Performance
- **Target**: 60 FPS on modern browsers
- **Object Pooling** for projectiles and particles
- **Optimized Rendering** with dirty rectangle checks
- **Spatial Partitioning** for collision detection

## 🚀 Running Locally

### Option 1: Simple HTTP Server (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/tower-defense.git
cd tower-defense

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# Then open: http://localhost:8000
```

### Option 2: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Why a server?
Modern browsers block ES6 module loading from `file://` URLs for security. A local server is required.

## 📦 Deployment to GitHub Pages

### Automatic Deployment

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the main branch.

### Setup Steps

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"

2. **Push your code**:
   ```bash
   git add .
   git commit -m "Deploy tower defense game"
   git push origin main
   ```

3. **Wait for deployment** (about 1-2 minutes)

4. **Access your game** at: `https://yourusername.github.io/repository-name/`

### Manual Deployment

If you prefer manual deployment:

1. Build is not required (pure HTML/CSS/JS)
2. Simply push files to `gh-pages` branch
3. Or use GitHub Pages settings to deploy from main branch

## 🎨 Game Balance Notes

### Wave Progression
- **Waves 1-5**: Tutorial difficulty, introduces enemy types
- **Waves 6-10**: Medium challenge, requires strategy
- **Waves 11-15**: Hard, need good tower placement
- **Waves 16-20**: Expert, requires optimal play

### Economy Balance
- **Starting Money**: $500 (enough for 5 basic towers or 3-4 advanced towers)
- **Kill Rewards**: Scale with enemy difficulty
- **Wave Completion**: Bonus money to help with progression
- **Tower Sell Value**: 50% to discourage constant rebuilding

### Tower Balance

| Tower | DPS (L1) | DPS (L3) | Cost to Max | Best Value |
|-------|----------|----------|-------------|------------|
| Basic | 20 | 105 | $325 | ⭐⭐⭐⭐ |
| Sniper | 25 | 200 | $450 | ⭐⭐⭐⭐⭐ |
| Splash | 15† | 90† | $575 | ⭐⭐⭐⭐⭐ |
| Slow | 7.5 | 50 | $395 | ⭐⭐⭐ |

*† Splash tower DPS is per enemy; actual DPS much higher vs groups*

## 🐛 Known Issues & Future Features

### Known Issues
- None currently! Report bugs via GitHub Issues

### Planned Features
- [ ] Sound effects toggle
- [ ] More enemy types
- [ ] Additional tower types
- [ ] Challenge modes
- [ ] Mobile touch controls
- [ ] High score leaderboard
- [ ] Map editor
- [ ] Difficulty settings

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share interesting map seeds

## 📄 License

This project is open source and available under the MIT License.

## 🎓 Educational Value

This project demonstrates:
- Game development patterns (ECS, State Management)
- Procedural generation algorithms
- Pathfinding (A* algorithm)
- Canvas rendering optimization
- Event-driven architecture
- Browser game deployment

Perfect for learning game development or as a portfolio piece!

## 🙏 Credits

- **Game Design**: Classic tower defense mechanics
- **Graphics**: Procedurally generated with Canvas API
- **Sound**: Web Audio API procedural effects
- **Algorithm**: A* pathfinding, Mulberry32 PRNG

---

**Enjoy the game!** If you create an interesting map, share the seed in the discussions! 🎮

Made with ❤️ using pure JavaScript
