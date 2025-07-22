import { Controller } from "jsnes";

// Type definitions
interface KeyMapping {
  [key: number]: [number, string, string];
}

interface ControllerOptions {
  onButtonDown: (player: number, button: string) => void;
  onButtonUp: (player: number, button: string) => void;
}

// Mapping keyboard code to [controller, button]
const KEYS: KeyMapping = {
  88: [1, Controller.BUTTON_A, "X"], // X
  89: [1, Controller.BUTTON_B, "Y"], // Y (Central European keyboard)
  90: [1, Controller.BUTTON_B, "Z"], // Z
  17: [1, Controller.BUTTON_SELECT, "Right Ctrl"], // Right Ctrl
  13: [1, Controller.BUTTON_START, "Enter"], // Enter
  38: [1, Controller.BUTTON_UP, "Up"], // Up
  40: [1, Controller.BUTTON_DOWN, "Down"], // Down
  37: [1, Controller.BUTTON_LEFT, "Left"], // Left
  39: [1, Controller.BUTTON_RIGHT, "Right"], // Right
  103: [2, Controller.BUTTON_A, "Num-7"], // Num-7
  105: [2, Controller.BUTTON_B, "Num-9"], // Num-9
  99: [2, Controller.BUTTON_SELECT, "Num-3"], // Num-3
  97: [2, Controller.BUTTON_START, "Num-1"], // Num-1
  104: [2, Controller.BUTTON_UP, "Num-8"], // Num-8
  98: [2, Controller.BUTTON_DOWN, "Num-2"], // Num-2
  100: [2, Controller.BUTTON_LEFT, "Num-4"], // Num-4
  102: [2, Controller.BUTTON_RIGHT, "Num-6"] // Num-6
};

// Modern key mapping using key names for fallback
const KEY_NAMES: { [key: string]: [number, string, string] } = {
  'KeyX': [1, Controller.BUTTON_A, "X"],
  'KeyZ': [1, Controller.BUTTON_B, "Z"],
  'ControlRight': [1, Controller.BUTTON_SELECT, "Right Ctrl"],
  'Enter': [1, Controller.BUTTON_START, "Enter"],
  'ArrowUp': [1, Controller.BUTTON_UP, "Up"],
  'ArrowDown': [1, Controller.BUTTON_DOWN, "Down"],
  'ArrowLeft': [1, Controller.BUTTON_LEFT, "Left"],
  'ArrowRight': [1, Controller.BUTTON_RIGHT, "Right"]
};

export default class KeyboardController {
  private onButtonDown: (player: number, button: string) => void;
  private onButtonUp: (player: number, button: string) => void;
  private keys: KeyMapping;

  constructor(options: ControllerOptions) {
    this.onButtonDown = options.onButtonDown;
    this.onButtonUp = options.onButtonUp;
    this.keys = KEYS;
    this.loadKeys();
  }

  loadKeys = (): void => {
    let keys: KeyMapping | null = null;
    try {
      const keysString = localStorage.getItem("keys");
      if (keysString) {
        keys = JSON.parse(keysString) as KeyMapping;
      }
    } catch (e) {
      console.log("Failed to get keys from localStorage.", e);
    }

    this.keys = keys || KEYS;
  };

  setKeys = (newKeys: KeyMapping): void => {
    try {
      localStorage.setItem("keys", JSON.stringify(newKeys));
      this.keys = newKeys;
    } catch (e) {
      console.log("Failed to set keys in localStorage");
    }
  };

  handleKeyDown = (e: KeyboardEvent): void => {
    console.log('KeyDown event:', e.code, e.key);
    
    // Try keyCode first (legacy)
    let key = this.keys[e.keyCode];
    
    // Fallback to modern code property
    if (!key && e.code) {
      key = KEY_NAMES[e.code];
    }
    
    if (key) {
      console.log('Button down:', key[0], key[1]);
      this.onButtonDown(key[0], key[1]);
      e.preventDefault();
    } else {
      console.log('No mapping found for keyCode:', 'code:', e.code);
    }
  };

  handleKeyUp = (e: KeyboardEvent): void => {
    console.log('KeyUp event:', e.code, e.key);
    
    // Try keyCode first (legacy)
    let key = this.keys[e.keyCode];
    
    // Fallback to modern code property
    if (!key && e.code) {
      key = KEY_NAMES[e.code];
    }
    
    if (key) {
      console.log('Button up:', key[0], key[1]);
      this.onButtonUp(key[0], key[1]);
      e.preventDefault();
    }
  };

  handleKeyPress = (e: KeyboardEvent): void => {
    e.preventDefault();
  };

  addEventListeners = (): void => {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("keypress", this.handleKeyPress);
  }

  // Method to remove event listeners
  removeEventListeners = (): void => {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keypress', this.handleKeyPress);
  };
}
