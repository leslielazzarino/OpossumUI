// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  AttributionData,
  Attributions,
  Criticality,
  Resources,
  ResourcesToAttributions,
  ResourcesWithAttributedChildren,
} from '../../../shared/shared-types';
import { PathPredicate } from '../../types/types';
import React, { ReactElement } from 'react';
import {
  StyledTreeItemLabel,
  StyledTreeItemProps,
} from '../StyledTreeItemLabel/StyledTreeItemLabel';
import { getClosestParentAttributions } from '../../util/get-closest-parent-attributions';
import { ResourceIDsToStyledTreeItemProps } from '../../state/actions/resource-actions/types';
import { canResourceHaveChildren } from '../../util/can-resource-have-children';
import { identity, pickBy } from 'lodash';

export function getTreeItemLabelPropsForAll(
  resources: Resources,
  resourcesToManualAttributions: ResourcesToAttributions,
  manualAttributions: Attributions,
  resourcesWithManualAttributedChildren: ResourcesWithAttributedChildren,
  resolvedExternalAttributions: Set<string>,
  isAttributionBreakpoint: PathPredicate,
  isFileWithChildren: PathPredicate,
  externalData: AttributionData
): ResourceIDsToStyledTreeItemProps {
  const resourceIDsToStyledTreeItemProps: ResourceIDsToStyledTreeItemProps = {};
  const resourceIdsWithResources: Array<[string, Resources | 1]> =
    getResourceIdsWithResources({ '': resources });

  for (const resourceIdWithResources of resourceIdsWithResources) {
    resourceIDsToStyledTreeItemProps[resourceIdWithResources[0]] =
      getTreeItemLabelProps(
        '',
        resourceIdWithResources[1],
        resourceIdWithResources[0],
        resourcesToManualAttributions,
        externalData.resourcesToAttributions,
        manualAttributions,
        externalData.resourcesWithAttributedChildren,
        resourcesWithManualAttributedChildren,
        resolvedExternalAttributions,
        isAttributionBreakpoint,
        isFileWithChildren,
        externalData
      );
  }

  return resourceIDsToStyledTreeItemProps;
}

function getResourceIdsWithResources(
  resources: Resources,
  parentPath = '',
  resourceIdsWithResources: Array<[string, Resources | 1]> = []
): Array<[string, Resources | 1]> {
  for (const resourceName of Object.keys(resources)) {
    const resource: Resources | 1 = resources[resourceName];
    const reasourceId = `${parentPath}${resourceName}${
      canResourceHaveChildren(resource) ? '/' : ''
    }`;
    resourceIdsWithResources.push([reasourceId, resource]);

    if (resource !== 1) {
      getResourceIdsWithResources(
        resource,
        reasourceId,
        resourceIdsWithResources
      );
    }
  }

  return resourceIdsWithResources;
}

export function getTreeItemLabel(
  resourceName: string,
  resourceId: string,
  resourceIDsToStyledTreeItemProps: ResourceIDsToStyledTreeItemProps
): ReactElement {
  return (
    <StyledTreeItemLabel
      {...resourceIDsToStyledTreeItemProps[resourceId]}
      labelText={getDisplayName(resourceName)}
    />
  );
}

export function getTreeItemLabelProps(
  resourceName: string,
  resource: Resources | 1,
  nodeId: string,
  resourcesToManualAttributions: ResourcesToAttributions,
  resourcesToExternalAttributions: ResourcesToAttributions,
  manualAttributions: Attributions,
  resourcesWithExternalAttributedChildren: ResourcesWithAttributedChildren,
  resourcesWithManualAttributedChildren: ResourcesWithAttributedChildren,
  resolvedExternalAttributions: Set<string>,
  isAttributionBreakpoint: PathPredicate,
  isFileWithChildren: PathPredicate,
  externalData: AttributionData
): StyledTreeItemProps {
  const canHaveChildren = resource !== 1;

  return pickBy(
    {
      canHaveChildren,
      hasManualAttribution: hasManualAttribution(
        nodeId,
        resourcesToManualAttributions
      ),
      hasExternalAttribution: hasExternalAttribution(
        nodeId,
        resourcesToExternalAttributions
      ),
      hasUnresolvedExternalAttribution: hasUnresolvedExternalAttribution(
        nodeId,
        resourcesToExternalAttributions,
        resolvedExternalAttributions
      ),
      hasParentWithManualAttribution:
        hasParentWithManualAttributionAndNoOwnAttribution(
          nodeId,
          manualAttributions,
          resourcesToManualAttributions,
          isAttributionBreakpoint
        ),
      containsExternalAttribution: containsExternalAttribution(
        nodeId,
        resourcesWithExternalAttributedChildren
      ),
      containsManualAttribution: containsManualAttribution(
        nodeId,
        resourcesWithManualAttributedChildren
      ),
      criticality: getCriticality(
        nodeId,
        resourcesToExternalAttributions,
        externalData.attributions
      ),
      isAttributionBreakpoint: isAttributionBreakpoint(nodeId),
      showFolderIcon: canHaveChildren && !isFileWithChildren(nodeId),
      containsResourcesWithOnlyExternalAttribution:
        canHaveChildren &&
        containsResourcesWithOnlyExternalAttribution(
          nodeId,
          resourcesToManualAttributions,
          resourcesToExternalAttributions,
          resource
        ),
    },
    identity
  );
}

export function getCriticality(
  nodeId: string,
  resourcesToExternalAttributions: ResourcesToAttributions,
  externalAttributions: Attributions
): Criticality | undefined {
  if (hasExternalAttribution(nodeId, resourcesToExternalAttributions)) {
    const attributionsForResource = resourcesToExternalAttributions[nodeId];
    for (const attributionId of attributionsForResource) {
      if (
        externalAttributions[attributionId].criticality === Criticality.High
      ) {
        return Criticality.High;
      }
    }

    for (const attributionId of attributionsForResource) {
      if (
        externalAttributions[attributionId].criticality === Criticality.Medium
      ) {
        return Criticality.Medium;
      }
    }

    return undefined;
  }
}

function isRootResource(resourceName: string): boolean {
  return resourceName === '';
}

function getDisplayName(resourceName: string): string {
  return isRootResource(resourceName) ? '/' : resourceName;
}

function hasManualAttribution(
  nodeId: string,
  resourcesToManualAttributions: ResourcesToAttributions
): boolean {
  return nodeId in resourcesToManualAttributions;
}

function hasExternalAttribution(
  nodeId: string,
  resourcesToExternalAttributions: ResourcesToAttributions
): boolean {
  return nodeId in resourcesToExternalAttributions;
}

function hasUnresolvedExternalAttribution(
  nodeId: string,
  resourcesToExternalAttributions: ResourcesToAttributions,
  resolvedExternalAttributions: Set<string>
): boolean {
  return (
    nodeId in resourcesToExternalAttributions &&
    resourcesToExternalAttributions[nodeId].filter(
      (attribution) => !resolvedExternalAttributions.has(attribution)
    ).length > 0
  );
}

function containsExternalAttribution(
  nodeId: string,
  resourcesWithExternalAttributedChildren: ResourcesWithAttributedChildren
): boolean {
  return (
    resourcesWithExternalAttributedChildren &&
    nodeId in resourcesWithExternalAttributedChildren
  );
}

function containsManualAttribution(
  nodeId: string,
  resourcesWithManualAttributedChildren: ResourcesWithAttributedChildren
): boolean {
  return (
    resourcesWithManualAttributedChildren &&
    nodeId in resourcesWithManualAttributedChildren
  );
}

function hasParentWithManualAttribution(
  nodeId: string,
  manualAttributions: Attributions,
  resourcesToManualAttributions: ResourcesToAttributions,
  isAttributionBreakpoint: PathPredicate
): boolean {
  return (
    getClosestParentAttributions(
      nodeId,
      manualAttributions,
      resourcesToManualAttributions,
      isAttributionBreakpoint
    ) !== null
  );
}

function hasParentWithManualAttributionAndNoOwnAttribution(
  nodeId: string,
  manualAttributions: Attributions,
  resourcesToManualAttributions: ResourcesToAttributions,
  isAttributionBreakpoint: PathPredicate
): boolean {
  return (
    hasParentWithManualAttribution(
      nodeId,
      manualAttributions,
      resourcesToManualAttributions,
      isAttributionBreakpoint
    ) && !hasManualAttribution(nodeId, resourcesToManualAttributions)
  );
}

function containsResourcesWithOnlyExternalAttribution(
  nodeId: string,
  resourcesToManualAttributions: ResourcesToAttributions,
  resourcesToExternalAttributions: ResourcesToAttributions,
  resource: Resources | 1
): boolean {
  if (hasManualAttribution(nodeId, resourcesToManualAttributions)) return false;
  if (hasExternalAttribution(nodeId, resourcesToExternalAttributions))
    return true;
  if (resource === 1) return false;
  return Object.keys(resource).some((node) =>
    containsResourcesWithOnlyExternalAttribution(
      resource[node] === 1 ? nodeId + node : nodeId + node + '/',
      resourcesToManualAttributions,
      resourcesToExternalAttributions,
      resource[node]
    )
  );
}
