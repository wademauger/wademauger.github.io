import React from 'react';

// Clear module cache so we can reliably mock modules that may have been
// imported by other tests earlier in the process.
jest.resetModules();

// Use the manual Jest mock for GoogleDriveServiceModern
jest.mock('@/apps/songs/services/GoogleDriveServiceModern');

// Mock PanelDiagram to avoid rendering complex SVG/JSX during tests
jest.mock('@/components/PanelDiagram', () => ({
  PanelDiagram: (props: any) => {
    // simple placeholder showing selectedId for assertion/debug
    return React.createElement('div', { 'data-testid': 'panel-diagram' }, JSON.stringify({ selectedId: props.selectedId }));
  },
  __esModule: true
}));

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PanelShapeCreator from '@/apps/colorwork-designer/PanelShapeCreator';
import { DropdownProvider, useDropdown } from '@/components/DropdownProvider';
import GoogleDriveServiceModern from '@/apps/songs/services/GoogleDriveServiceModern';

// Small harness that exposes the dropdown-registered menu items as real buttons
const MenuHarness = () => {
  const { menuItems } = useDropdown();
  return (
    <div data-testid="menu-harness">
      {menuItems && menuItems.map((it: any) => (
        <button key={it.key} onClick={it.onClick}>{it.label}</button>
      ))}
    </div>
  );
};

describe('PanelShapeCreator - create, save, open flow', () => {
  // Some CI or full-suite runs can be slower; increase default timeout for these integration-style tests
  jest.setTimeout(30000);
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide matchMedia for antd responsive utilities
    // @ts-ignore
    window.matchMedia = window.matchMedia || function() {
      return { matches: false, addListener: () => {}, removeListener: () => {} };
    };
    // Ensure legacy modules that expect a global React variable find it
    // @ts-ignore
    global.React = React;
  });

  test('edits geometry, saves panel to library, and opens it back into creator', async () => {
    // Configure the manual mock for GoogleDriveServiceModern
    // (the module is automatically replaced by the contents of src/apps/songs/services/__mocks__/GoogleDriveServiceModern.ts)
  GoogleDriveServiceModern.isSignedIn = true;
  GoogleDriveServiceModern.accessToken = 'mock-token';
  // Ensure these are jest mock functions so test can configure them safely
  // (some environments may not expose mock methods directly on the auto-mocked module)
  // @ts-ignore
  GoogleDriveServiceModern.getSettings = jest.fn(() => ({}));
  // @ts-ignore
  GoogleDriveServiceModern.findFile = jest.fn().mockResolvedValue({ found: false });
  // @ts-ignore
  GoogleDriveServiceModern.createNewLibrary = jest.fn().mockResolvedValue({ fileId: 'fid-1' });
  // @ts-ignore
  GoogleDriveServiceModern.loadLibraryById = jest.fn().mockResolvedValue({ panels: {} });
  // @ts-ignore
  GoogleDriveServiceModern.saveLibraryToFile = jest.fn().mockResolvedValue(undefined);

    render(
      <DropdownProvider>
        <PanelShapeCreator />
        <MenuHarness />
      </DropdownProvider>
    );

    // Find the height input (first spinbutton) and change it to a distinct value
    const spinbuttons = await screen.findAllByRole('spinbutton');
    const heightInput = spinbuttons[0];
    // Change value to 55
    fireEvent.change(heightInput, { target: { value: '55' } });
    fireEvent.blur(heightInput);

    // Open Save As modal via the harness button (menu item registered by component)
    const saveAsBtn = await screen.findByText('Save As...');
    fireEvent.click(saveAsBtn);

    // Fill the name and save
    const nameInput = await screen.findByPlaceholderText('Enter panel name');
    fireEvent.change(nameInput, { target: { value: 'TestPanel' } });

  // Find the modal dialog (title will be "Save Panel As") and click its Save button
  const dialog = await screen.findByRole('dialog', { name: /save panel as/i });
  const saveBtn = within(dialog).getByRole('button', { name: /save/i });
  fireEvent.click(saveBtn);

    // Wait for saveLibraryToFile to be called
    await waitFor(() => expect(GoogleDriveServiceModern.saveLibraryToFile).toHaveBeenCalled());

    // Assert it was called with the fileId returned from createNewLibrary
    expect(GoogleDriveServiceModern.saveLibraryToFile).toHaveBeenCalledWith(
      'fid-1',
      expect.objectContaining({
        panels: expect.objectContaining({
          TestPanel: expect.any(Object)
        })
      })
    );

    // Now simulate that the library file exists and contains our saved panel
    (GoogleDriveServiceModern.findFile as jest.Mock).mockResolvedValue({ found: true, fileId: 'fid-1' });
    (GoogleDriveServiceModern.loadLibraryById as jest.Mock).mockResolvedValue({
      panels: {
        TestPanel: {
          name: 'TestPanel',
          shape: {
            height: 55,
            baseA: 20,
            baseB: 30,
            successors: []
          }
        }
      }
    });

    // Open the Open... modal via harness and select the saved panel
    const openBtn = await screen.findByText('Open...');
    fireEvent.click(openBtn);

    // Wait for the saved panel to appear in the list and click it
    const savedItem = await screen.findByText('TestPanel');
    fireEvent.click(savedItem);

    // After opening, the creator should have the loaded shape; assert height input shows 55
    await waitFor(() => expect(screen.getByDisplayValue('55')).toBeInTheDocument());
  });
});
