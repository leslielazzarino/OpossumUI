// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement, useContext, useMemo, useState } from 'react';
import {
  AttributionData,
  AggregatedData,
  Attributions,
} from '../../../shared/shared-types';
import { AccordionPanel } from './AccordionPanel';
import { PanelData } from '../../types/types';
import { AccordionWorkersContext } from '../WorkersContextProvider/WorkersContextProvider';

type Load = Array<AggregatedData>;

export interface AccordionState {
  resourceId: string;
  load: Load;
}

const EMPTY_STATE = {
  resourceId: '',
  load: [],
};

interface WorkerArgs {
  selectedResourceId: string;
  externalData?: AttributionData;
}

interface WorkerAccordionPanelProps {
  workerArgs: WorkerArgs;
  syncFallbackArgs?: WorkerArgs;
  getExpensiveCalculation(workerArgs: WorkerArgs): Array<AggregatedData>;
  attributions: Attributions;
}

export function WorkerAccordionPanel(
  props: WorkerAccordionPanelProps
): ReactElement {
  const [state, setAccordionState] = useState<AccordionState>(EMPTY_STATE);
  const workers = useContext(AccordionWorkersContext);

  const worker = workers.AccordionWorker;

  useMemo(() => {
    loadAggregatedData(
      props.workerArgs,
      worker,
      setAccordionState,
      props.getExpensiveCalculation,
      props.syncFallbackArgs
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.syncFallbackArgs, worker, props.workerArgs]);

  let panelData: PanelData;
  if (props.workerArgs.selectedResourceId === state.resourceId) {
    panelData = {
      aggregatedData: state.load,
      attributions: props.attributions,
    };
  } else {
    panelData = {
      aggregatedData: [],
      attributions: props.attributions,
    };
  }

  return <AccordionPanel panelData={panelData} />;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function loadAggregatedData(
  workerArgs: WorkerArgs,
  worker: Worker,
  setAccordionState: (state: AccordionState) => void,
  getExpensiveCalculation: (workerArgs: WorkerArgs) => Array<AggregatedData>,
  syncFallbackArgs?: WorkerArgs
): Promise<void> {
  setAccordionState(EMPTY_STATE);

  // WebWorkers can fail for different reasons, e.g. because they run out
  // of memory with huge input files or because Jest does not support
  // them. When they fail the accordion is calculated on main. The error
  // message is logged in the console.
  try {
    worker.postMessage(workerArgs);

    worker.onmessage = ({ data: { output } }): void => {
      if (!output) {
        logErrorAndComputeInMainProcess(
          Error('Web Worker execution error.'),
          setAccordionState,
          getExpensiveCalculation,
          workerArgs,
          syncFallbackArgs
        );
      } else {
        setAccordionState(output);
      }
    };
  } catch (error) {
    logErrorAndComputeInMainProcess(
      error,
      setAccordionState,
      getExpensiveCalculation,
      workerArgs,
      syncFallbackArgs
    );
  }
}

function logErrorAndComputeInMainProcess(
  error: unknown,
  setAccordionState: (state: AccordionState) => void,
  getExpensiveCalculation: (workerArgs: WorkerArgs) => Array<AggregatedData>,
  workerArgs: WorkerArgs,
  syncFallbackArgs?: WorkerArgs
): void {
  console.info('Error in ResourceTab: ', error);

  const attributionIdsWithCount = getExpensiveCalculation(
    syncFallbackArgs || workerArgs
  );

  setAccordionState({
    resourceId: workerArgs.selectedResourceId,
    load: attributionIdsWithCount,
  });
}
