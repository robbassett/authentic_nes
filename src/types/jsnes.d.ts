declare module 'jsnes' {
  export class NES {
    constructor(options?: {
      onFrame?: (buffer: number[]) => void;
      onStatusUpdate?: (status: string) => void;
      onAudioSample?: (left: number, right: number) => void;
      sampleRate?: number;
    });
    loadROM(romData: any): void;
    buttonDown(player: number, button: string): void;
    buttonUp(player: number, button: string): void;
    frame(): void;
    getFPS?(): number;
    zapperMove?(x: number, y: number): void;
    zapperFireDown?(): void;
    zapperFireUp?(): void;
    destroy?(): void;
  }

  export namespace Controller {
    export const BUTTON_A: string;
    export const BUTTON_B: string;
    export const BUTTON_SELECT: string;
    export const BUTTON_START: string;
    export const BUTTON_UP: string;
    export const BUTTON_DOWN: string;
    export const BUTTON_LEFT: string;
    export const BUTTON_RIGHT: string;
  }
}
