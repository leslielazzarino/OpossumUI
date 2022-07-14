// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { initialResourceState } from '../../../state/reducers/resource-reducer';
import {
  isAttributionViewSelected,
  isAuditViewSelected,
  isReportViewSelected,
} from '../../../state/selectors/view-selector';
import { renderComponentWithStore } from '../../../test-helpers/render-component-with-store';
import { TopBar } from '../TopBar';
import { AllowedFrontendChannels } from '../../../../shared/ipc-channels';

describe('TopBar', () => {
  test('renders an Open file icon', () => {
    const { store } = renderComponentWithStore(<TopBar />);
    expect(window.electronAPI.on).toHaveBeenCalledTimes(9);
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.FileLoaded,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.Logging,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ResetLoadedFile,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ExportFileRequest,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ShowSearchPopup,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ShowProjectMetadataPopup,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ShowProjectStatisticsPopup,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.SetBaseURLForRoot,
      expect.anything()
    );
    expect(window.electronAPI.on).toHaveBeenCalledWith(
      AllowedFrontendChannels.ToggleHighlightForCriticalSignals,
      expect.anything()
    );

    fireEvent.click(screen.queryByLabelText('open file') as Element);
    expect(store.getState().resourceState).toMatchObject(initialResourceState);
    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.openFile).toHaveBeenCalledWith();
  });

  test('switches between views', () => {
    const { store } = renderComponentWithStore(<TopBar />);

    fireEvent.click(screen.queryByText('Audit') as Element);
    expect(isAuditViewSelected(store.getState())).toBe(true);
    expect(isAttributionViewSelected(store.getState())).toBe(false);
    expect(isReportViewSelected(store.getState())).toBe(false);

    fireEvent.click(screen.queryByText('Attribution') as Element);
    expect(isAuditViewSelected(store.getState())).toBe(false);
    expect(isAttributionViewSelected(store.getState())).toBe(true);
    expect(isReportViewSelected(store.getState())).toBe(false);

    fireEvent.click(screen.queryByText('Report') as Element);
    expect(isAuditViewSelected(store.getState())).toBe(false);
    expect(isAttributionViewSelected(store.getState())).toBe(false);
    expect(isReportViewSelected(store.getState())).toBe(true);
  });
});
