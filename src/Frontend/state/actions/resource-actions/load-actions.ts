// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { ParsedFileContent } from '../../../../shared/shared-types';
import { AppThunkAction, AppThunkDispatch } from '../../types';
import {
  setAttributionBreakpoints,
  setBaseUrlsForSources,
  setExternalAttributionSources,
  setExternalData,
  setFilesWithChildren,
  setFrequentLicenses,
  setManualData,
  setProgressBarData,
  setProjectMetadata,
  setResources,
  setTreeItemLabelProps,
} from './all-views-simple-actions';
import { addResolvedExternalAttribution } from './audit-view-simple-actions';
import { getTreeItemLabelPropsForAll } from '../../../Components/ResourceBrowser/get-tree-item-label';
import {
  getAttributionBreakpoints,
  getExternalData,
  getFilesWithChildren,
  getManualAttributions,
  getResources,
  getResourcesToManualAttributions,
  getResourcesWithManualAttributedChildren,
} from '../../selectors/all-views-resource-selectors';
import { getResolvedExternalAttributions } from '../../selectors/audit-view-resource-selectors';
import { getAttributionBreakpointCheck } from '../../../util/is-attribution-breakpoint';
import { getFileWithChildrenCheck } from '../../../util/is-file-with-children';
import { State } from '../../../types/types';

export function loadFromFile(
  parsedFileContent: ParsedFileContent
): AppThunkAction {
  return (dispatch: AppThunkDispatch, getState: () => State): void => {
    dispatch(setResources(parsedFileContent.resources));

    dispatch(
      setManualData(
        parsedFileContent.manualAttributions.attributions,
        parsedFileContent.manualAttributions.resourcesToAttributions
      )
    );

    dispatch(
      setExternalData(
        parsedFileContent.externalAttributions.attributions,
        parsedFileContent.externalAttributions.resourcesToAttributions
      )
    );

    dispatch(setFrequentLicenses(parsedFileContent.frequentLicenses));

    dispatch(
      setAttributionBreakpoints(parsedFileContent.attributionBreakpoints)
    );

    dispatch(setFilesWithChildren(parsedFileContent.filesWithChildren));

    dispatch(setProjectMetadata(parsedFileContent.metadata));

    dispatch(setBaseUrlsForSources(parsedFileContent.baseUrlsForSources));

    dispatch(
      setExternalAttributionSources(
        parsedFileContent.externalAttributionSources
      )
    );

    parsedFileContent.resolvedExternalAttributions.forEach((attribution) =>
      dispatch(addResolvedExternalAttribution(attribution))
    );

    console.time('getTreeItemLabelPropsForAll');
    const state = getState();
    dispatch(
      setTreeItemLabelProps(
        getTreeItemLabelPropsForAll(
          getResources(state) || {},
          getResourcesToManualAttributions(state),
          getManualAttributions(state),
          getResourcesWithManualAttributedChildren(state),
          getResolvedExternalAttributions(state),
          getAttributionBreakpointCheck(getAttributionBreakpoints(state)),
          getFileWithChildrenCheck(getFilesWithChildren(state)),
          getExternalData(state)
        )
      )
    );
    console.timeEnd('getTreeItemLabelPropsForAll');

    dispatch(
      setProgressBarData(
        parsedFileContent.resources,
        parsedFileContent.manualAttributions.attributions,
        parsedFileContent.manualAttributions.resourcesToAttributions,
        parsedFileContent.externalAttributions.resourcesToAttributions,
        parsedFileContent.resolvedExternalAttributions
      )
    );
  };
}
