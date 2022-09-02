// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiTypography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { ReactElement, useMemo, useState } from 'react';
import { AggregatedData } from '../../../shared/shared-types';
import { PackagePanel } from '../PackagePanel/PackagePanel';
import { PanelData } from '../../types/types';
import { PackagePanelTitle } from '../../enums/enums';

const classes = {
  expansionPanelExpanded: {
    margin: '0px !important',
  },
  expansionPanelSummary: {
    minHeight: '24px !important',
    '& div.MuiAccordionSummary-content': {
      margin: '0px',
    },
    '& div.MuiAccordionSummary-expandIcon': {
      padding: '6px 12px',
    },
    padding: '0 12px',
  },
  expansionPanelDetails: {
    height: '100%',
    padding: '0 12px 16px',
  },
  expansionPanelTransition: {
    '& div.MuiCollapse-root': { transition: 'none' },
  },
};

interface AccordionPanelProps {
  panelData: PanelData;
  isAddToPackageEnabled?: boolean;
}

export function AccordionPanel(props: AccordionPanelProps): ReactElement {
  const [expanded, setExpanded] = useState<boolean>(false);

  useMemo(() => {
    setExpanded(props.panelData.aggregatedData?.length > 0);
  }, [props.panelData.aggregatedData]);

  function handleExpansionChange(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: React.ChangeEvent<unknown>,
    targetExpansionState: boolean
  ): void {
    setExpanded(targetExpansionState);
  }

  return (
    <MuiAccordion
      sx={{
        ...classes.expansionPanelExpanded,
        '&.MuiAccordion-root': classes.expansionPanelTransition,
      }}
      elevation={0}
      square={true}
      key={`PackagePanel-${PackagePanelTitle.ContainedManualPackages}`}
      expanded={expanded}
      onChange={handleExpansionChange}
      disabled={isDisabled(props.panelData.aggregatedData)}
    >
      <MuiAccordionSummary
        sx={{
          '&.MuiAccordionSummary-root': classes.expansionPanelSummary,
        }}
        expandIcon={<ExpandMoreIcon />}
      >
        <MuiTypography>
          {PackagePanelTitle.ContainedManualPackages}
        </MuiTypography>
      </MuiAccordionSummary>
      <MuiAccordionDetails
        sx={{
          '&.MuiAccordionDetails-root': classes.expansionPanelDetails,
        }}
      >
        <PackagePanel
          title={PackagePanelTitle.ContainedManualPackages}
          attributionIdsWithCount={props.panelData.aggregatedData}
          attributions={props.panelData.attributions}
          isAddToPackageEnabled={props.isAddToPackageEnabled || false}
        />
      </MuiAccordionDetails>
    </MuiAccordion>
  );
}

function isDisabled(attributionIdsWithCount: Array<AggregatedData>): boolean {
  return (
    attributionIdsWithCount === undefined ||
    (attributionIdsWithCount && attributionIdsWithCount?.length === 0)
  );
}
