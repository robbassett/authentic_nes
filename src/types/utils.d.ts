declare module './utils' {
  function loadBinary(
    path: string,
    callback: (err: Error | null, data?: string) => void,
    handleProgress: () => void
  ): XMLHttpRequest;
  
  export default loadBinary;
}
