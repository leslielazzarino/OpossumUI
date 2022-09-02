// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  AttributionData,
  AggregatedData,
  Attributions,
  PackageInfo,
  ResourcesToAttributions,
} from '../../shared/shared-types';
import { getAttributedChildren } from './get-attributed-children';

export function getExternalAttributionIdsWithCount(
  attributionIds: Array<string>
): Array<AggregatedData> {
  return attributionIds.map((attributionId) => ({
    attributionId,
  }));
}

export function getContainedExternalPackages(args: {
  selectedResourceId: string;
  externalData: AttributionData;
}): Array<AggregatedData> {
  const externalAttributedChildren = getAttributedChildren(
    args.externalData.resourcesWithAttributedChildren,
    args.selectedResourceId
  );

  return computeAggregatedAttributionsFromChildren(
    args.externalData.attributions,
    args.externalData.resourcesToAttributions,
    externalAttributedChildren,
    new Set()
  );
}

export function getContainedManualPackages(args: {
  selectedResourceId: string;
  manualData: AttributionData;
}): Array<AggregatedData> {
  const manualAttributedChildren = getAttributedChildren(
    args.manualData.resourcesWithAttributedChildren,
    args.selectedResourceId
  );

  return computeAggregatedAttributionsFromChildren(
    args.manualData.attributions,
    args.manualData.resourcesToAttributions,
    manualAttributedChildren
  );
}

// exported for testing
export function computeAggregatedAttributionsFromChildren(
  attributions: Attributions,
  resourcesToAttributions: ResourcesToAttributions,
  attributedChildren: Set<string>,
  resolvedExternalAttributions?: Set<string>
): Array<AggregatedData> {
  const attributionCount: { [attributionId: string]: number } = {};
  attributedChildren.forEach((child: string) => {
    resourcesToAttributions[child].forEach((attributionId: string) => {
      if (
        !resolvedExternalAttributions ||
        !resolvedExternalAttributions.has(attributionId)
      ) {
        attributionCount[attributionId] =
          (attributionCount[attributionId] || 0) + 1;
      }
    });
  });

  return Object.keys(attributionCount)
    .map((attributionId: string) => ({
      attributionId,
      childrenWithAttributionCount: attributionCount[attributionId],
    }))
    .sort(sortByCountAndPackageName(attributions));
}

export function sortByCountAndPackageName(attributions: Attributions) {
  return function (a1: AggregatedData, a2: AggregatedData): number {
    if (
      a1.childrenWithAttributionCount &&
      a2.childrenWithAttributionCount &&
      a1.childrenWithAttributionCount !== a2.childrenWithAttributionCount
    ) {
      return a2.childrenWithAttributionCount - a1.childrenWithAttributionCount;
    }

    const p1: PackageInfo = attributions[a1.attributionId];
    const p2: PackageInfo = attributions[a2.attributionId];
    if (p1?.packageName && p2?.packageName) {
      return p1.packageName.localeCompare(p2.packageName, undefined, {
        sensitivity: 'base',
      });
    } else if (p1?.packageName) {
      return -1;
    } else if (p2?.packageName) {
      return 1;
    }
    return 0;
  };
}
