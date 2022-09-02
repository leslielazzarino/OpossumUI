// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  AggregatedData,
  Attributions,
  ExternalAttributionSources,
  Source,
} from '../../../shared/shared-types';

export function getSortedSources(
  attributions: Attributions,
  attributionIdsWithCount: Array<AggregatedData>,
  attributionSources: ExternalAttributionSources
): Array<string> {
  function reducer(
    sources: Set<string>,
    attributionIdWithCount: AggregatedData
  ): Set<string> {
    const source: Source | undefined =
      attributions[attributionIdWithCount.attributionId]?.source;
    sources.add(source ? source.name : '');

    return sources;
  }

  const sources = Array.from(
    attributionIdsWithCount.reduce(reducer, new Set())
  );

  return sortSources(sources, attributionSources);
}

function sortSources(
  sources: Array<string>,
  attributionSources: ExternalAttributionSources
): Array<string> {
  const { knownSources, unknownSources } = sources.reduce(
    (
      encounteredSources: {
        knownSources: Array<string>;
        unknownSources: Array<string>;
      },
      source: string
    ) => {
      if (attributionSources.hasOwnProperty(source)) {
        encounteredSources.knownSources.push(source);
      } else {
        encounteredSources.unknownSources.push(source);
      }
      return encounteredSources;
    },
    { knownSources: [], unknownSources: [] }
  );

  const sortedKnownSources = knownSources.sort((sourceA, sourceB) => {
    return (
      -(
        attributionSources[sourceA]?.priority -
        attributionSources[sourceB]?.priority
      ) ||
      attributionSources[sourceA]?.name.localeCompare(
        attributionSources[sourceB]?.name
      )
    );
  });

  return sortedKnownSources.concat(unknownSources.sort());
}

export function getAttributionIdsWithCountForSource(
  attributionIds: Array<AggregatedData>,
  attributions: Attributions,
  sourceName: string
): Array<AggregatedData> {
  return attributionIds.filter((attributionIdWithCount) => {
    const source: Source | undefined =
      attributions[attributionIdWithCount.attributionId]?.source;

    return sourceName
      ? Boolean(source?.name && source?.name === sourceName)
      : !source;
  });
}
