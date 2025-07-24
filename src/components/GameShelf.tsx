import { Stack, Text } from "@mantine/core";

import EmulatorRefContext from "../context/EmulatorRefContext";
import { useContext } from "react";

export const GameShelf = () => {
    const emulatorRef = useContext(EmulatorRefContext);

    const ROM_FILES = [
        {id: 'rom1', file:'dushlan.nes', name: 'Dushlan'},
        {id: 'rom2', file:'fs.nes', name: 'Super Floofy Sheepie'},
        {id: 'rom3', file:'MultiDude.nes', name: 'Multi Dude'},
        {id: 'rom4', file:'owlia.nes', name: 'The Legends of Owlia'},
        {id: 'rom5', file:'nomolos.nes', name: 'Nomolos: Storming the Castle'},
        {id: 'rom6', file:'sw.nes', name:'Solar Wars'},
        {id: 'rom7', file:'ctg.nes', name:'Cheril the Goddess'}
    ]

    const handleClick = (romFile:string) => {
        emulatorRef?.current?.handleRom(romFile);
    }

    return <Stack>
        <h2>ROMs</h2>
        {ROM_FILES.map((item) => (
            <Text
                key={item.id}
                size='lg'
                fw={700}
                c='blue'
                style={{
                    cursor:'pointer',
                    userSelect:'none'
                }}
                onClick={() => handleClick(item.file)}
            >
                {item.name}
            </Text>
        ))}
    </Stack>
}