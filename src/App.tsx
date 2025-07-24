import { useRef } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";

import { BasicAppShell } from "./layouts/AppShell";
import { Emulator } from "./components/Emulator";
import EmulatorRefContext from "./context/EmulatorRefContext";

export default function App() {
  const emulatorRef = useRef(null);

  return <MantineProvider theme={theme}>
    <EmulatorRefContext.Provider value={emulatorRef}>
      <BasicAppShell main={<Emulator ref={emulatorRef}/>}/>
    </EmulatorRefContext.Provider>
  </MantineProvider>;
}
