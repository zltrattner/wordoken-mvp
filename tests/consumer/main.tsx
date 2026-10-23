// Test the emitted public package, not source-path imports.
import { createRoot } from 'react-dom/client';
import { ActionButton, Fighters, WordokenTheme } from '@wordoken/ui';
import '@wordoken/ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <WordokenTheme>
    <ActionButton onClick={() => {}}>PACKAGE CONSUMER</ActionButton>
    <Fighters />
  </WordokenTheme>,
);
