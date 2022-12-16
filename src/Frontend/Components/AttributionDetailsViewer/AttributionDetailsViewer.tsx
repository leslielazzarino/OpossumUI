// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import MuiTypography from '@mui/material/Typography';
import React, { ReactElement, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { PackageInfo } from '../../../shared/shared-types';
import { getTemporaryPackageInfo } from '../../state/selectors/all-views-resource-selectors';
import { AttributionColumn } from '../AttributionColumn/AttributionColumn';
import { ResourcesList } from '../ResourcesList/ResourcesList';
import { isEqual } from 'lodash';
import {
  deleteAttributionGloballyAndSave,
  savePackageInfo,
  savePackageInfoIfSavingIsNotDisabled,
} from '../../state/actions/resource-actions/save-actions';
import { setTemporaryPackageInfo } from '../../state/actions/resource-actions/all-views-simple-actions';
import {
  getResourceIdsOfSelectedAttribution,
  getSelectedAttributionId,
} from '../../state/selectors/attribution-view-resource-selectors';
import { OpossumColors } from '../../shared-styles';
import { useWindowHeight } from '../../util/use-window-height';
import { openPopup } from '../../state/actions/view-actions/view-actions';
import { PopupType } from '../../enums/enums';
import { setUpdateTemporaryPackageInfoForCreator } from '../../util/set-update-temporary-package-info-for-creator';
import MuiBox from '@mui/material/Box';

const classes = {
  root: {
    background: OpossumColors.lightestBlue,
    flex: 1,
    display: 'flex',
    padding: '8px',
    height: '100%',
  },
  resourceColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    height: '100%',
    paddingRight: '8px',
    overflowY: 'auto',
    minWidth: '240px',
  },
  typography: {
    marginTop: '8px',
  },
};

export function AttributionDetailsViewer(): ReactElement | null {
  const selectedAttributionId = useAppSelector(getSelectedAttributionId);
  const temporaryPackageInfo = useAppSelector(getTemporaryPackageInfo);
  const resourceIdsOfSelectedAttributionId: Array<string> = useAppSelector(
    getResourceIdsOfSelectedAttribution,
    isEqual
  );

  const resourceListMaxHeight = useWindowHeight() - 112;

  const dispatch = useAppDispatch();

  const saveFileRequestListener = useCallback(() => {
    dispatch(
      savePackageInfoIfSavingIsNotDisabled(
        null,
        selectedAttributionId,
        temporaryPackageInfo
      )
    );
  }, [dispatch, selectedAttributionId, temporaryPackageInfo]);

  const dispatchSavePackageInfo = useCallback(() => {
    dispatch(
      savePackageInfo(null, selectedAttributionId, temporaryPackageInfo)
    );
  }, [dispatch, selectedAttributionId, temporaryPackageInfo]);

  const setUpdateTemporaryPackageInfoFor =
    setUpdateTemporaryPackageInfoForCreator(dispatch);

  function deleteAttribution(): void {
    if (temporaryPackageInfo.preSelected) {
      dispatch(deleteAttributionGloballyAndSave(selectedAttributionId));
    } else {
      dispatch(
        openPopup(PopupType.ConfirmDeletionPopup, selectedAttributionId)
      );
    }
  }

  return selectedAttributionId ? (
    <MuiBox sx={classes.root}>
      <MuiBox sx={classes.resourceColumn}>
        <MuiTypography sx={classes.typography} variant={'subtitle1'}>
          Linked Resources
        </MuiTypography>
        <ResourcesList
          resourcesListBatches={[
            { resourceIds: resourceIdsOfSelectedAttributionId },
          ]}
          maxHeight={resourceListMaxHeight}
        />
      </MuiBox>
      <AttributionColumn
        isEditable={true}
        showManualAttributionData={true}
        areButtonsHidden={false}
        displayPackageInfo={temporaryPackageInfo}
        setUpdateTemporaryPackageInfoFor={setUpdateTemporaryPackageInfoFor}
        onSaveButtonClick={dispatchSavePackageInfo}
        onDeleteButtonClick={deleteAttribution}
        setTemporaryPackageInfo={(packageInfo: PackageInfo): void => {
          dispatch(setTemporaryPackageInfo(packageInfo));
        }}
        saveFileRequestListener={saveFileRequestListener}
      />
    </MuiBox>
  ) : null;
}
