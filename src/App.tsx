import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";

import { BasicAppShell } from "./layouts/AppShell";
import { Emulator } from "./components/Emulator";

export default function App() {
  return <MantineProvider theme={theme}>
    <BasicAppShell main={<Emulator/>}/>
  </MantineProvider>;
}
