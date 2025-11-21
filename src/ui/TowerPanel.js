// Tower selection and info panel

import { getTowerInfo, getTowerCost, getAllTowerTypes } from '../entities/TowerTypes.js';
import { CONFIG } from '../utils/Config.js';

export class TowerPanel {
    constructor(gameState) {
        this.gameState = gameState;

        // Get DOM elements
        this.panel = document.getElementById('tower-panel');
        this.buttonsContainer = document.getElementById('tower-buttons');
        this.infoContainer = document.getElementById('tower-info');

        this.selectedType = null;
        this.selectedTower = null;

        this.createTowerButtons();
    }

    createTowerButtons() {
        if (!this.buttonsContainer) return;

        this.buttonsContainer.innerHTML = '';

        const towerTypes = getAllTowerTypes();

        for (const type of towerTypes) {
            const info = getTowerInfo(type);
            const cost = getTowerCost(type);

            const button = document.createElement('button');
            button.className = 'tower-btn';
            button.dataset.type = type;

            button.innerHTML = `
                <div class="tower-btn-header">
                    <span>${info.name}</span>
                    <span class="tower-btn-cost">$${cost}</span>
                </div>
                <div class="tower-btn-description">${info.description}</div>
            `;

            button.addEventListener('click', () => {
                this.selectTowerType(type, button);
            });

            this.buttonsContainer.appendChild(button);
        }
    }

    selectTowerType(type, buttonElement) {
        // Deselect any selected tower
        this.gameState.deselectTower();
        this.selectedTower = null;

        // Toggle selection
        if (this.selectedType === type) {
            this.selectedType = null;
            this.gameState.selectedTowerType = null;
            buttonElement.classList.remove('selected');
            this.hideInfo();
        } else {
            // Remove selection from all buttons
            const allButtons = this.buttonsContainer.querySelectorAll('.tower-btn');
            allButtons.forEach(btn => btn.classList.remove('selected'));

            this.selectedType = type;
            this.gameState.selectedTowerType = type;
            buttonElement.classList.add('selected');
            this.showTowerTypeInfo(type);
        }
    }

    showTowerTypeInfo(type) {
        const info = getTowerInfo(type);

        if (!this.infoContainer) return;

        this.infoContainer.innerHTML = `
            <h4>${info.name}</h4>
            <div class="tower-stat">
                <span>Damage:</span>
                <span>${info.stats.damage}</span>
            </div>
            <div class="tower-stat">
                <span>Range:</span>
                <span>${info.stats.range}</span>
            </div>
            <div class="tower-stat">
                <span>Fire Rate:</span>
                <span>${info.stats.fireRate}/s</span>
            </div>
            ${info.stats.splashRadius ? `
                <div class="tower-stat">
                    <span>Splash:</span>
                    <span>${info.stats.splashRadius}</span>
                </div>
            ` : ''}
            ${info.stats.slowAmount ? `
                <div class="tower-stat">
                    <span>Slow:</span>
                    <span>${Math.round(info.stats.slowAmount * 100)}%</span>
                </div>
            ` : ''}
        `;

        this.infoContainer.classList.remove('hidden');
    }

    showTowerInfo(tower) {
        if (!tower) {
            this.hideInfo();
            this.selectedTower = null;

            // Deselect all tower buttons
            const allButtons = this.buttonsContainer.querySelectorAll('.tower-btn');
            allButtons.forEach(btn => btn.classList.remove('selected'));

            return;
        }

        this.selectedTower = tower;
        this.selectedType = null;
        this.gameState.selectedTowerType = null;

        // Deselect all tower type buttons
        const allButtons = this.buttonsContainer.querySelectorAll('.tower-btn');
        allButtons.forEach(btn => btn.classList.remove('selected'));

        if (!this.infoContainer) return;

        const info = tower.getInfo();
        const canUpgrade = tower.canUpgrade();
        const canAfford = this.gameState.canAfford(info.upgradeCost);

        this.infoContainer.innerHTML = `
            <h4>${info.name} (Level ${info.level})</h4>
            <div class="tower-stat">
                <span>Damage:</span>
                <span>${info.damage}</span>
            </div>
            <div class="tower-stat">
                <span>Range:</span>
                <span>${info.range}</span>
            </div>
            <div class="tower-stat">
                <span>Fire Rate:</span>
                <span>${info.fireRate.toFixed(1)}/s</span>
            </div>
            ${info.splashRadius ? `
                <div class="tower-stat">
                    <span>Splash:</span>
                    <span>${info.splashRadius}</span>
                </div>
            ` : ''}
            ${info.slowAmount ? `
                <div class="tower-stat">
                    <span>Slow:</span>
                    <span>${Math.round(info.slowAmount * 100)}%</span>
                </div>
            ` : ''}
            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
                ${canUpgrade ? `
                    <button id="upgrade-tower-btn" class="btn btn-primary" ${!canAfford ? 'disabled' : ''}>
                        Upgrade ($${info.upgradeCost})
                    </button>
                ` : '<p style="text-align: center; opacity: 0.7;">Max Level</p>'}
                <button id="sell-tower-btn" class="btn">
                    Sell ($${info.sellValue})
                </button>
            </div>
        `;

        this.infoContainer.classList.remove('hidden');

        // Add event listeners for upgrade/sell buttons
        const upgradeBtn = document.getElementById('upgrade-tower-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.onUpgradeTower();
            });
        }

        const sellBtn = document.getElementById('sell-tower-btn');
        if (sellBtn) {
            sellBtn.addEventListener('click', () => {
                this.onSellTower();
            });
        }
    }

    onUpgradeTower() {
        if (this.selectedTower) {
            const event = new CustomEvent('upgradeTower', {
                detail: { tower: this.selectedTower }
            });
            window.dispatchEvent(event);
        }
    }

    onSellTower() {
        if (this.selectedTower) {
            const event = new CustomEvent('sellTower', {
                detail: { tower: this.selectedTower }
            });
            window.dispatchEvent(event);
        }
    }

    hideInfo() {
        if (this.infoContainer) {
            this.infoContainer.classList.add('hidden');
            this.infoContainer.innerHTML = '';
        }
    }

    show() {
        if (this.panel) {
            console.log('TowerPanel.show() called');
            this.panel.classList.remove('hidden');
            // Clear inline display style to let CSS/flexbox handle it
            this.panel.style.display = '';
            console.log('Panel classList:', this.panel.classList.toString());
            console.log('Panel computed style:', window.getComputedStyle(this.panel).display);
        }
    }

    hide() {
        if (this.panel) {
            this.panel.classList.add('hidden');
        }
    }

    update() {
        // Update button states based on money
        const buttons = this.buttonsContainer.querySelectorAll('.tower-btn');

        buttons.forEach(button => {
            const type = button.dataset.type;
            const cost = getTowerCost(type);
            const canAfford = this.gameState.canAfford(cost);

            if (canAfford) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });

        // Update selected tower info if tower is selected
        if (this.selectedTower) {
            this.showTowerInfo(this.selectedTower);
        }
    }
}

export default TowerPanel;
