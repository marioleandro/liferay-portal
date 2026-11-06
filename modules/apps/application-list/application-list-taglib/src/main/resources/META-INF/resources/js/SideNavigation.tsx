/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayEmptyState from '@clayui/empty-state';
import {ClayVerticalNav} from '@clayui/nav';
import {SearchResultsMessage} from '@liferay/layout-js-components-web';
import classNames from 'classnames';
import {
	UnifiedSidebar,
	UnifiedSidebarSiteSelector,
	useId,
} from 'frontend-js-components-web';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import SideNavigationItemContent from './SideNavigationItemContent';
import SideNavigationResultsSkeleton from './SideNavigationResultsSkeleton';
import SideNavigationScopeItem from './SideNavigationScopeItem';
import SideNavigationSearchInput from './SideNavigationSearchInput';
import {SideNavigationItem} from './types/SideNavigation';
import {useSideNavigationFilter} from './useSideNavigationFilter';
import {useSideNavigationItems} from './useSideNavigationItems';
import {useSideNavigationStuck} from './useSideNavigationStuck';

const OVERLAY_MEDIA_QUERY = '(max-width: 991.98px)';
const SIDENAV_TRANSITION_TIMEOUT = 300;

interface Props {
	canonicalName: string;
	categoryImageUrl: string;
	colorScheme: 'dark' | 'light';
	colorSchemeSessionKey: string;
	expandedKeys: Array<React.Key>;
	expandedKeysSessionKey: string;
	fixed: boolean;
	items: Array<SideNavigationItem>;
	label: string;
	navigationItemsURL: string;
	selectedPortletId: string;
	siteAdministrationItemSelectedEventName: string;
	siteAdministrationItemSelectorUrl: string;
	visible: boolean;
	visibleSessionKey: string;
}

function countNavigableItems(
	navigationItems: Array<SideNavigationItem>
): number {
	return navigationItems.reduce(
		(count, navigationItem) =>
			count +
			(navigationItem.href ? 1 : 0) +
			(navigationItem.items
				? countNavigableItems(navigationItem.items)
				: 0),
		0
	);
}

function SideNavigation({
	canonicalName,
	categoryImageUrl,
	colorScheme,
	colorSchemeSessionKey,
	expandedKeys: externalExpandedKeys,
	expandedKeysSessionKey,
	fixed,
	items: externalItems,
	label,
	navigationItemsURL,
	selectedPortletId,
	siteAdministrationItemSelectedEventName,
	siteAdministrationItemSelectorUrl,
	visible: initialVisible,
	visibleSessionKey,
}: Props) {
	const containerRef = useRef<HTMLElement | null>(
		document.getElementById(
			'com_liferay_application_list_taglib_side_navigation_container'
		)
	);

	const [initialExpandedKeys] = useState<Set<React.Key>>(
		() => new Set(externalExpandedKeys)
	);

	const [userExpandedKeys, setUserExpandedKeys] =
		useState<Set<React.Key>>(initialExpandedKeys);

	const [closedAsOverlay] = useState(
		() =>
			fixed &&
			initialVisible &&
			window.matchMedia(OVERLAY_MEDIA_QUERY).matches
	);

	const [visible, setVisible] = useState(initialVisible && !closedAsOverlay);

	const baseId = useId();

	const scrollRef = useRef<HTMLDivElement>(null);

	const {
		items: navigationItems,
		loading,
		prefetchFilterOnlyItems,
	} = useSideNavigationItems(externalItems, navigationItemsURL);

	const {expandedKeys, isFilterActive, items, numberOfMatches, setQuery} =
		useSideNavigationFilter(navigationItems);

	const [filterCollapse, setFilterCollapse] = useState<{
		appliesTo: Set<React.Key>;
		expandedKeys: Set<React.Key>;
	}>();

	const effectiveExpandedKeys =
		filterCollapse && filterCollapse.appliesTo === expandedKeys
			? filterCollapse.expandedKeys
			: expandedKeys ?? userExpandedKeys;

	const updateExpandedKeys = useCallback(
		async (updatedExpandedKeys: Set<React.Key>) => {
			if (isFilterActive && expandedKeys) {
				setFilterCollapse({
					appliesTo: expandedKeys,
					expandedKeys: updatedExpandedKeys,
				});

				return;
			}

			await Liferay.Util.Session.set(
				expandedKeysSessionKey,
				Array.from(updatedExpandedKeys).join(',')
			);

			setUserExpandedKeys(updatedExpandedKeys);
		},
		[expandedKeys, expandedKeysSessionKey, isFilterActive]
	);

	const sidenavTransitionControllerRef = useRef<AbortController | null>(null);

	const updateVisible = useCallback(
		async (visible: boolean) => {
			await Liferay.Util.Session.set(
				visibleSessionKey,
				visible ? 'visible' : 'hidden'
			);

			if (fixed) {
				const {body} = document;

				sidenavTransitionControllerRef.current?.abort();

				const sidenavTransitionController = new AbortController();

				sidenavTransitionControllerRef.current =
					sidenavTransitionController;

				const endSidenavTransition = () => {
					body.classList.remove('sidenav-transition');

					sidenavTransitionController.abort();
				};

				body.addEventListener(
					'transitionend',
					(event) => {
						if (
							event.propertyName === 'padding-left' &&
							(event.target as HTMLElement).id === 'wrapper'
						) {
							endSidenavTransition();
						}
					},
					{signal: sidenavTransitionController.signal}
				);

				const timeoutId = setTimeout(
					endSidenavTransition,
					SIDENAV_TRANSITION_TIMEOUT
				);

				sidenavTransitionController.signal.addEventListener(
					'abort',
					() => clearTimeout(timeoutId)
				);

				body.classList.add('sidenav-transition');
				body.classList.toggle('open', visible);
				body.classList.toggle('product-menu-open', visible);
			}

			setVisible(visible);

			Liferay.fire('sideNavigationStateChanged', {visible});
		},
		[fixed, visibleSessionKey]
	);

	useEffect(
		function closeOverlayOnLoad() {
			if (!closedAsOverlay) {
				return;
			}

			document.body.classList.remove('open', 'product-menu-open');

			Liferay.fire('sideNavigationStateChanged', {visible: false});
		},
		[closedAsOverlay]
	);

	useEffect(function cleanupSidenavTransition() {
		return () => {
			sidenavTransitionControllerRef.current?.abort();

			document.body.classList.remove('sidenav-transition');
		};
	}, []);

	useEffect(
		function setupVisibilityRequestHandler() {
			async function handleStateRequest({visible}: {visible: boolean}) {
				await updateVisible(visible);
			}

			Liferay.on('sideNavigationStateRequested', handleStateRequest);

			return () =>
				Liferay.detach(
					'sideNavigationStateRequested',
					handleStateRequest
				);
		},
		[updateVisible]
	);

	const numberOfResults = useMemo(
		() => (isFilterActive ? numberOfMatches : countNavigableItems(items)),
		[isFilterActive, items, numberOfMatches]
	);

	// Keep already matched items on screen while the filter-only items are
	// still loading, so a slow request cannot blank a complete result set.

	const showResultsSkeleton = isFilterActive && loading && !numberOfResults;

	const stuck = useSideNavigationStuck(scrollRef, items);

	return (
		<UnifiedSidebar
			canonicalName={canonicalName}
			categoryImageUrl={categoryImageUrl}
			colorScheme={colorScheme}
			colorSchemeSessionKey={colorSchemeSessionKey}
			containerRef={containerRef}
			headerActions={
				siteAdministrationItemSelectedEventName &&
				siteAdministrationItemSelectorUrl ? (
					<UnifiedSidebarSiteSelector
						eventName={siteAdministrationItemSelectedEventName}
						url={siteAdministrationItemSelectorUrl}
					/>
				) : undefined
			}
			label={label}
			navigationId="com_liferay_application_list_taglib_side_navigation"
			onOpenChange={updateVisible}
			open={visible}
			testId="sideNavigation"
		>
			{fixed && visible && (
				<div
					aria-hidden="true"
					className="side-navigation-backdrop"
					onClick={() => updateVisible(false)}
				/>
			)}

			<UnifiedSidebar.Top>
				<SideNavigationSearchInput
					onChange={setQuery}
					onFocus={prefetchFilterOnlyItems}
				/>

				<SearchResultsMessage
					numberOfResults={
						showResultsSkeleton ? null : numberOfResults
					}
					resultType={Liferay.Language.get('navigation-items')}
				/>
			</UnifiedSidebar.Top>

			<div
				className={classNames('side-navigation-scroll', {
					'side-navigation-scroll-stuck': stuck,
				})}
				ref={scrollRef}
			>
				<UnifiedSidebar.Body className="c-px-0">
					{showResultsSkeleton ? (
						<SideNavigationResultsSkeleton />
					) : numberOfResults ? (
						<ClayVerticalNav
							active={selectedPortletId}
							defaultExpandedKeys={initialExpandedKeys}
							displayType="primary"
							expandedKeys={effectiveExpandedKeys}
							itemAriaCurrent={true}
							items={items}
							onExpandedChange={updateExpandedKeys}
							stacked={true}
						>
							{(collectionItem) => {
								if (typeof collectionItem === 'string') {
									return <span>{collectionItem}</span>;
								}

								const item =
									collectionItem as SideNavigationItem;
								const scopeItemId = `${baseId}-${item.scope}`;

								if (item.scopeMarker && item.scope) {
									return (
										<SideNavigationScopeItem
											id={scopeItemId}
											key={item.id}
											label={item.label}
											scope={item.scope}
										/>
									);
								}

								return (
									<ClayVerticalNav.Item
										aria-describedby={
											item.scope ? scopeItemId : undefined
										}
										className={classNames({
											'side-navigation-scope-zone':
												item.scope,
											[`side-navigation-scope-zone-${item.scope}`]:
												item.scope,
											'side-navigation-section-item':
												item.parentLabel,
										})}
										data-canonical-name={item.canonicalName}
										href={item.href}
										items={item.items}
										key={item.id}
										textValue={item.label}
									>
										<SideNavigationItemContent
											item={item}
										/>
									</ClayVerticalNav.Item>
								);
							}}
						</ClayVerticalNav>
					) : (
						<ClayEmptyState
							className="c-mt-n2 c-px-4 text-center"
							description={Liferay.Language.get(
								'adjust-or-clear-the-search-to-view-all-navigation-items'
							)}
							small
							title={Liferay.Language.get('no-matching-items')}
						/>
					)}
				</UnifiedSidebar.Body>

				<div className="side-navigation-scroll-shadow" />
			</div>
		</UnifiedSidebar>
	);
}

export default SideNavigation;
