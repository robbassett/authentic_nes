# Authentic NES

This repository contains a NES emulating React application built with the Mantine Vite template. The functional React components making up this project are based on jsnes-web and include additional features aimed at creating an immersive NES experience. In particular the CRT component utilises `glfx.js` render the NES emulator as it might have looked on an old cathode ray tube television. Additional immersive features are currently in development (including audio :D )!

Currently included are a number of homebrew NES roms sourced from nes.world.com. ROM selection in the UI is currently not enabled, but ROMs can be swapped by modifying the ROM loading script at the top of Emulator.tsx, check the public folder for available ROM files.