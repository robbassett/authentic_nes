declare module 'glfx' {
  interface GLFXCanvas extends HTMLCanvasElement {
    texture(source: HTMLCanvasElement | HTMLImageElement): GLFXTexture;
    draw(texture: GLFXTexture): GLFXCanvas;
    bulgePinch(centerX: number, centerY: number, radius: number, strength: number): GLFXCanvas;
    vignette(size: number, amount: number): GLFXCanvas;
    update(): GLFXCanvas;
  }

  interface GLFXTexture {
    loadContentsOf(source: HTMLCanvasElement | HTMLImageElement): void;
  }

  interface GLFX {
    canvas(): GLFXCanvas;
  }

  const fx: GLFX;
  export default fx;
}
