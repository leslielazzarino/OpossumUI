// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { AttributionData } from '../../shared/shared-types';
import { getContainedExternalPackages } from '../util/get-contained-packages';
import { AccordionState } from '../Components/AggregatedAttributionsPanel/WorkerAccordionPanel';

let cachedExternalData: AttributionData | null = null;

self.onmessage = ({ data: { selectedResourceId, externalData } }): void => {
  // externalData = null is used to empty the cached data
  if (externalData !== undefined) {
    cachedExternalData = externalData;
  }

  if (selectedResourceId) {
    if (cachedExternalData) {
      const load = getContainedExternalPackages({
        selectedResourceId,
        externalData: cachedExternalData,
      });
      const output: AccordionState = {
        resourceId: selectedResourceId,
        load,
      };

      self.postMessage({
        output,
      });
    } else {
      self.postMessage({
        output: null,
      });
    }
  }
};

self.onerror = (): void => {
  cachedExternalData = null;
};
