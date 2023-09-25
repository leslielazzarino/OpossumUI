// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  Attributions,
  DiscreteConfidence,
  Resources,
  ResourcesToAttributions,
  SaveFileArgs,
} from '../../../../shared/shared-types';
import {
  clickOnButton,
  getButton,
  getParsedInputFileEnrichedWithTestData,
  mockElectronBackendOpenFile,
  mockElectronIpcRendererOn,
} from '../../../test-helpers/general-test-helpers';
import { renderComponentWithStore } from '../../../test-helpers/render-component-with-store';
import { App } from '../../../Components/App/App';
import { Screen, screen } from '@testing-library/react';
import { ButtonText } from '../../../enums/enums';
import { clickOnElementInResourceBrowser } from '../../../test-helpers/resource-browser-test-helpers';
import {
  clickOnButtonInHamburgerMenu,
  expectButtonInHamburgerMenuIsNotShown,
  expectValueInTextBox,
} from '../../../test-helpers/attribution-column-test-helpers';
import React from 'react';
import { AllowedFrontendChannels } from '../../../../shared/ipc-channels';
import { act } from 'react-dom/test-utils';

function mockSaveFileRequestChannel(): void {
  window.electronAPI.on
    // @ts-ignore
    .mockImplementation(
      mockElectronIpcRendererOn(AllowedFrontendChannels.SaveFileRequest, false),
    );
}

describe('Audit view preferred functionality', () => {
  it('preferred button is shown and sets an attribution as preferred', () => {
    function getExpectedSaveFileArgs(preferred: boolean): SaveFileArgs {
      const expected_args: SaveFileArgs = {
        manualAttributions: {
          uuid: {
            packageName: 'jQuery',
            packageVersion: '16.0.0',
            attributionConfidence: DiscreteConfidence.Low,
          },
        },
        resolvedExternalAttributions: new Set<string>(),
        resourcesToAttributions: {
          '/file': ['uuid'],
        },
      };
      if (preferred) {
        expected_args.manualAttributions.uuid.preferred = true;
      }

      return expected_args;
    }

    const testResources: Resources = {
      file: 1,
    };
    const testManualAttributions: Attributions = {
      uuid: {
        packageName: 'jQuery',
        packageVersion: '16.0.0',
        attributionConfidence: DiscreteConfidence.Low,
      },
    };
    const testResourcesToManualAttributions: ResourcesToAttributions = {
      '/file': ['uuid'],
    };

    mockElectronBackendOpenFile(
      getParsedInputFileEnrichedWithTestData({
        resources: testResources,
        manualAttributions: testManualAttributions,
        resourcesToManualAttributions: testResourcesToManualAttributions,
        externalAttributionSources: {
          SC: {
            name: 'ScanCode',
            priority: 1,
            isRelevantForPreferred: true,
          },
        },
      }),
    );
    renderComponentWithStore(<App />);
    clickOnButton(screen, ButtonText.Close);

    clickOnElementInResourceBrowser(screen, 'file');
    expectValueInTextBox(screen, 'Name', 'jQuery');

    expectButtonInHamburgerMenuIsNotShown(screen, ButtonText.UnmarkAsPreferred);

    clickOnButtonInHamburgerMenu(screen, ButtonText.MarkAsPreferred);
    clickOnButton(screen, ButtonText.Save);
    expect(window.electronAPI.saveFile).toHaveBeenNthCalledWith(
      1,
      getExpectedSaveFileArgs(true),
    );

    expectButtonInHamburgerMenuIsNotShown(screen, ButtonText.MarkAsPreferred);

    clickOnButtonInHamburgerMenu(screen, ButtonText.UnmarkAsPreferred);
    clickOnButton(screen, ButtonText.Save);
    expect(window.electronAPI.saveFile).toHaveBeenNthCalledWith(
      2,
      getExpectedSaveFileArgs(false),
    );

    expectButtonInHamburgerMenuIsNotShown(screen, ButtonText.UnmarkAsPreferred);

    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(2);
  });

  it('after setting an attribution to preferred, global save is disabled', () => {
    const testResources: Resources = {
      file: 1,
      other_file: 1,
      other_file_2: 1,
    };
    const testManualAttributions: Attributions = {
      uuid: {
        packageName: 'jQuery',
        packageVersion: '16.0.0',
        attributionConfidence: DiscreteConfidence.Low,
      },
    };
    const testResourcesToManualAttributions: ResourcesToAttributions = {
      '/file': ['uuid'],
      '/other_file': ['uuid'],
    };

    mockElectronBackendOpenFile(
      getParsedInputFileEnrichedWithTestData({
        resources: testResources,
        manualAttributions: testManualAttributions,
        resourcesToManualAttributions: testResourcesToManualAttributions,
        externalAttributionSources: {
          SC: {
            name: 'ScanCode',
            priority: 1,
            isRelevantForPreferred: true,
          },
        },
      }),
    );
    renderComponentWithStore(<App />);
    clickOnButton(screen, ButtonText.Close);

    clickOnElementInResourceBrowser(screen, 'file');
    expectValueInTextBox(screen, 'Name', 'jQuery');

    clickOnButtonInHamburgerMenu(screen, ButtonText.MarkAsPreferred);
    expect(getButton(screen, ButtonText.SaveGlobally)).toBeDisabled();
  });

  it('after setting an attribution to preferred, ctrl + s does not save globally', () => {
    function getExpectedSaveFileArgs(preferred: boolean): SaveFileArgs {
      const expected_args: SaveFileArgs = {
        manualAttributions: {
          uuid: {
            packageName: 'jQuery',
            packageVersion: '16.0.0',
            attributionConfidence: DiscreteConfidence.Low,
          },
        },
        resolvedExternalAttributions: new Set<string>(),
        resourcesToAttributions: {
          '/file': ['uuid'],
        },
      };
      if (preferred) {
        expected_args.manualAttributions.uuid.preferred = true;
      }

      return expected_args;
    }
    function isAttributionLinkedSomewhereElse(screen: Screen): void {
      expect(
        getButton(screen, ButtonText.SaveGlobally),
      ).not.toBeInTheDocument();
    }

    const testResources: Resources = {
      file: 1,
      other_file: 1,
      other_file_2: 1,
    };
    const testManualAttributions: Attributions = {
      uuid: {
        packageName: 'jQuery',
        packageVersion: '16.0.0',
        attributionConfidence: DiscreteConfidence.Low,
      },
    };
    const testResourcesToManualAttributions: ResourcesToAttributions = {
      '/file': ['uuid'],
      '/other_file': ['uuid'],
    };

    mockElectronBackendOpenFile(
      getParsedInputFileEnrichedWithTestData({
        resources: testResources,
        manualAttributions: testManualAttributions,
        resourcesToManualAttributions: testResourcesToManualAttributions,
        externalAttributionSources: {
          SC: {
            name: 'ScanCode',
            priority: 1,
            isRelevantForPreferred: true,
          },
        },
      }),
    );
    renderComponentWithStore(<App />);
    clickOnButton(screen, ButtonText.Close);

    clickOnElementInResourceBrowser(screen, 'file');
    expectValueInTextBox(screen, 'Name', 'jQuery');

    clickOnButtonInHamburgerMenu(screen, ButtonText.MarkAsPreferred);
    expect(getButton(screen, ButtonText.SaveGlobally)).toBeDisabled();
    expect(getButton(screen, ButtonText.Save)).toBeEnabled();

    act(() => {
      mockSaveFileRequestChannel();
    });
    expect(getButton(screen, ButtonText.Save)).toBeDisabled();
    expect(window.electronAPI.saveFile).toHaveBeenNthCalledWith(
      1,
      getExpectedSaveFileArgs(true),
    );
    isAttributionLinkedSomewhereElse(screen);
  });
});
