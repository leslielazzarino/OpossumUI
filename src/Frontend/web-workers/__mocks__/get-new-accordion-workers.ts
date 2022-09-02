// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { AccordionWorkers } from '../get-new-accordion-workers';

export function getNewAccordionWorkers(): AccordionWorkers {
  return {
    AccordionWorker: getNewContainedExternalAttributionsAccordionWorker(),
    containedManualAttributionsAccordionWorker:
      getNewContainedManualAttributionsAccordionWorker(),
  };
}

function getNewContainedExternalAttributionsAccordionWorker(): Worker {
  return {
    postMessage: () => {
      throw new Error(
        'JEST-MOCK-GET-NEW-CONTAINED-EXTERNAL-ATTRIBUTIONS-ACCORDION-WORKER'
      );
    },
  } as unknown as Worker;
}

function getNewContainedManualAttributionsAccordionWorker(): Worker {
  return {
    postMessage: () => {
      throw new Error(
        'JEST-MOCK-GET-NEW-CONTAINED-MANUAL-ATTRIBUTIONS-ACCORDION-WORKER'
      );
    },
  } as unknown as Worker;
}
