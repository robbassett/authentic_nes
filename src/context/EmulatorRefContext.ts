// EmulatorRefContext.ts
import React from 'react';
import { EmulatorRef } from '../components/Emulator';

// The context will hold a ref object that points to an EmulatorRef or null
const EmulatorRefContext = React.createContext<React.RefObject<EmulatorRef | null> | null>(null);

export default EmulatorRefContext;