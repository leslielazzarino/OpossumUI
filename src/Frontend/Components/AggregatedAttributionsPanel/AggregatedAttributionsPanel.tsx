// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement, useMemo } from 'react';
import { PackagePanelTitle } from '../../enums/enums';
import { WorkerAccordionPanel } from './WorkerAccordionPanel';
import { useAppSelector } from '../../state/hooks';
import {
  getExternalData,
  getManualData,
} from '../../state/selectors/all-views-resource-selectors';
import {
  getResolvedExternalAttributions,
  getSelectedResourceId,
} from '../../state/selectors/audit-view-resource-selectors';
import { isIdOfResourceWithChildren } from '../../util/can-resource-have-children';
import { AggregatedData } from '../../../shared/shared-types';
import { SyncAccordionPanel } from './SyncAccordionPanel';
import {
  getContainedExternalPackages,
  getContainedManualPackages,
  getExternalAttributionIdsWithCount,
} from '../../util/get-contained-packages';

interface AggregatedAttributionsPanelProps {
  isAddToPackageEnabled: boolean;
}

export function AggregatedAttributionsPanel(
  props: AggregatedAttributionsPanelProps
): ReactElement {
  const manualData = useAppSelector(getManualData);
  const externalData = useAppSelector(getExternalData);

  const selectedResourceId = useAppSelector(getSelectedResourceId);
  const resolvedExternalAttributions: Set<string> = useAppSelector(
    getResolvedExternalAttributions
  );

  const containedExternalPackagesWorkerArgs = useMemo(
    () => ({
      selectedResourceId,
      resolvedExternalAttributions,
    }),
    [selectedResourceId, resolvedExternalAttributions]
  );
  const containedExternalPackagesSyncFallbackArgs = useMemo(
    () => ({
      selectedResourceId,
      externalData,
      resolvedExternalAttributions,
    }),
    [selectedResourceId, externalData, resolvedExternalAttributions]
  );

  const containedManualPackagesWorkerArgs = useMemo(
    () => ({
      selectedResourceId,
      manualData,
    }),

    //  manualData is excluded from dependencies on purpose to avoid recalculation
    //  when it changes. Usually this is not an issue as the displayed data
    //  remains correct. Therefore the panelData is eventually consistent.
    //  We still need manualData.attributionsToResources in the dependencies to
    //  update panelData, when replaceAttributionPopup was called. This is
    //  relevant for manual attributions in the attributions in folder content panel.

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedResourceId, manualData.attributionsToResources]
  );

  return (
    <>
      <SyncAccordionPanel
        title={PackagePanelTitle.ExternalPackages}
        getAttributionIdsWithCount={(): Array<AggregatedData> =>
          getExternalAttributionIdsWithCount(
            externalData.resourcesToAttributions[selectedResourceId] || []
          )
        }
        attributions={externalData.attributions}
        isAddToPackageEnabled={props.isAddToPackageEnabled}
      />
      {isIdOfResourceWithChildren(selectedResourceId) ? (
        <>
          <WorkerAccordionPanel
            workerArgs={containedExternalPackagesWorkerArgs}
            syncFallbackArgs={containedExternalPackagesSyncFallbackArgs}
            getExpensiveCalculation={getContainedExternalPackages}
            attributions={externalData.attributions}
          />
          <WorkerAccordionPanel
            workerArgs={containedManualPackagesWorkerArgs}
            getExpensiveCalculation={getContainedManualPackages}
            attributions={manualData.attributions}
          />
        </>
      ) : null}
    </>
  );
}
