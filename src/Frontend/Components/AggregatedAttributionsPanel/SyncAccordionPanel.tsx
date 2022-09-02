// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement } from 'react';
import { AggregatedData, Attributions } from '../../../shared/shared-types';
import { AccordionPanel } from './AccordionPanel';
import { PackagePanelTitle } from '../../enums/enums';
import { PanelData } from '../../types/types';

interface SyncAccordionPanelProps {
  title: PackagePanelTitle;
  getAttributionIdsWithCount(): Array<AggregatedData>;
  attributions: Attributions;
  isAddToPackageEnabled: boolean;
}

export function SyncAccordionPanel(
  props: SyncAccordionPanelProps
): ReactElement {
  const panelData: PanelData = {
    aggregatedData: props.getAttributionIdsWithCount(),
    attributions: props.attributions,
  };

  return (
    <AccordionPanel
      panelData={panelData}
      isAddToPackageEnabled={props.isAddToPackageEnabled}
    />
  );
}
