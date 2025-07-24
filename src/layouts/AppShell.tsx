import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, Text } from '@mantine/core';
import { ReactNode } from 'react';

import { GameShelf } from '../components/GameShelf';

const Logo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="40" 
    height="40" 
    viewBox="0 0 12 12"
  >
    <path 
      fill="currentColor" 
      d="M2 6h7V5h1V3H8V2H6V1H5v1H3v1H1v2h1Zm1 6h2v-2h1v2h2v-2h2V7H9v1H8V7H3v1H2V7H1v3h2Zm1-7V4h1v1Zm2 0V4h1v1Zm0 0"
    />
  </svg>
)

export function BasicAppShell({main}: {main: ReactNode}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo/>
          <Text>Immersive NES</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <GameShelf/>
      </AppShell.Navbar>
      <AppShell.Main style={{height: "calc(100vh - 60px)", display:'flex', flexDirection:'column', overflow: 'hidden'}}>{main}</AppShell.Main>
    </AppShell>
  );
}
