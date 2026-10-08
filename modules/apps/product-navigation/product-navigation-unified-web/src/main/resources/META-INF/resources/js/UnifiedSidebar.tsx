/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {VerticalNav} from '@clayui/core';
import ClayIcon, {ClayIconSpriteContext} from '@clayui/icon';
import {ClayLinkContext} from '@clayui/link';
import classNames from 'classnames';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import Slot, {SlotContent} from './Slot';
import UnifiedColorSchemeButton from './UnifiedColorSchemeButton';
import UnifiedUserMenu from './UnifiedUserMenu';
import {
	initNavigationState,
	publishNavigationState,
	startPeek,
	stopPeek,
	useNavigationState,
} from './store';
import useIsMobile from './useIsMobile';

import type {
	NavigationItem,
	NavigationSection,
	Persistence,
	UserMenu,
} from './types';

import '../css/UnifiedNavigation.scss';

const SIDEBAR_WIDTH = '280px';

export interface UnifiedSidebarProps {
	active?: string;
	ariaLabel?: string;
	bodySlots?: SlotContent[];
	bodyTopSlot?: SlotContent;
	children?: React.ReactNode;

	/**
	 * Optional. Shows the dark/light mode button in the header.
	 */
	colorSchemeToggle?: boolean;
	defaultPinned?: boolean;
	headerSlot?: SlotContent;
	icon?: string;
	iconColor?: string;
	imageURL?: string;
	linkComponent?: React.ComponentType<any>;
	navigationId: string;
	onPinnedChange?: (pinned: boolean) => void;
	persistence?: Persistence;
	pinned?: boolean;

	/**
	 * Optional. Shows a search field above the menu that filters `sections` by
	 * label. Hosts with their own search pass it as `bodyTopSlot` instead.
	 */
	searchable?: boolean;
	sections?: NavigationSection[];
	spritemap?: string;
	title: string;
	userMenu?: UserMenu;
	userMenuSlot?: SlotContent;
}

interface VerticalNavItem extends NavigationItem {
	section?: boolean;
}

function collectParentIds(items: VerticalNavItem[]): React.Key[] {
	return items.flatMap((item) =>
		item.items?.length
			? [item.id, ...collectParentIds(item.items as VerticalNavItem[])]
			: []
	);
}

function filterItems(
	items: VerticalNavItem[],
	query: string
): VerticalNavItem[] {
	return items.flatMap((item) => {
		if (item.label.toLowerCase().includes(query)) {
			return [item];
		}

		const children = item.items
			? filterItems(item.items as VerticalNavItem[], query)
			: [];

		return children.length ? [{...item, items: children}] : [];
	});
}

function readPinned(persistence?: Persistence) {
	if (persistence?.type !== 'local') {
		return undefined;
	}

	try {
		const value = window.localStorage.getItem(persistence.key);

		return value === null ? undefined : value === 'true';
	}
	catch {
		return undefined;
	}
}

function writePinned(pinned: boolean, persistence?: Persistence) {
	if (!persistence) {
		return;
	}

	if (persistence.type === 'session') {
		Liferay.Util.Session.set(persistence.key, pinned ? 'visible' : 'hidden');

		return;
	}

	try {
		window.localStorage.setItem(persistence.key, String(pinned));
	}
	catch {}
}

export default function UnifiedSidebar({
	active,
	ariaLabel,
	bodySlots,
	bodyTopSlot,
	children,
	colorSchemeToggle = false,
	defaultPinned = true,
	headerSlot,
	icon,
	iconColor,
	imageURL,
	linkComponent,
	navigationId,
	onPinnedChange,
	persistence,
	pinned: externalPinned,
	searchable = false,
	sections,
	spritemap,
	title,
	userMenu,
	userMenuSlot,
}: UnifiedSidebarProps) {
	initNavigationState(navigationId, {
		pinned: externalPinned ?? readPinned(persistence) ?? defaultPinned,
	});

	const [{peek, pinned}, setState] = useNavigationState(navigationId);

	const isMobile = useIsMobile();

	const firstRenderRef = useRef(true);

	useEffect(() => {
		publishNavigationState(navigationId);
	}, [navigationId]);

	// The product icon lives on the toggle, which shows it while the panel is
	// peeked, so the sidebar hands it over through the shared state.

	useEffect(() => {
		setState({
			brandIcon: icon,
			brandIconColor: iconColor,
			brandImageURL: imageURL,
		});
	}, [icon, iconColor, imageURL, setState]);

	useEffect(() => {
		if (externalPinned !== undefined) {
			setState({pinned: externalPinned});
		}
	}, [externalPinned, setState]);

	useEffect(() => {
		if (firstRenderRef.current) {
			firstRenderRef.current = false;

			return;
		}

		writePinned(pinned, persistence);

		onPinnedChange?.(pinned);

		// Hosts own the pinned value when they pass it, so only react to the
		// store, not to callback identity.

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pinned]);

	// Hosts lay out their own content, so they read the reserved width and the
	// state from the root element instead of being wrapped by the component.

	useEffect(() => {
		const docked = pinned && !isMobile;

		document.documentElement.dataset.unifiedNavigation = docked
			? 'pinned'
			: 'unpinned';

		document.documentElement.style.setProperty(
			'--unified-navigation-start',
			docked ? SIDEBAR_WIDTH : '0px'
		);
	}, [isMobile, pinned]);

	useEffect(
		() => () => {
			delete document.documentElement.dataset.unifiedNavigation;

			document.documentElement.style.removeProperty(
				'--unified-navigation-start'
			);
		},
		[]
	);

	const open = pinned || peek;

	// The search and the footer cast a shadow only while the body is scrolled
	// past them, as in the prototype. A scroll listener, not an intersection
	// observer, so the state stays right while the body rests clipped.

	const bodyRef = useRef<HTMLDivElement>(null);

	const [clipped, setClipped] = useState({bottom: false, top: false});

	const updateClipped = useCallback(() => {
		const body = bodyRef.current;

		if (!body) {
			return;
		}

		const bottom =
			body.scrollTop + body.clientHeight < body.scrollHeight - 1;
		const top = body.scrollTop > 0;

		setClipped((previous) =>
			previous.bottom === bottom && previous.top === top
				? previous
				: {bottom, top}
		);
	}, []);

	useEffect(() => {
		const body = bodyRef.current;

		if (!body) {
			return;
		}

		updateClipped();

		const resizeObserver = new ResizeObserver(updateClipped);

		resizeObserver.observe(body);

		Array.from(body.children).forEach((child) =>
			resizeObserver.observe(child)
		);

		return () => resizeObserver.disconnect();
	}, [updateClipped]);

	useEffect(() => {
		if (!peek || pinned) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				stopPeek(navigationId, true);
			}
		}

		document.addEventListener('keydown', handleKeyDown);

		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [navigationId, peek, pinned]);

	const navItems = useMemo<VerticalNavItem[] | undefined>(
		() =>
			sections?.flatMap((section) =>
				section.label
					? [
							{
								id: section.id,
								items: section.items,
								label: section.label,
								section: true,
							},
						]
					: section.items
			),
		[sections]
	);

	const [query, setQuery] = useState('');

	const filteredNavItems = useMemo(
		() =>
			navItems && query.trim()
				? filterItems(navItems, query.trim().toLowerCase())
				: navItems,
		[navItems, query]
	);

	// While filtering, every group with a match opens; otherwise only the
	// sections start expanded.

	const expandedKeys = useMemo(
		() =>
			new Set<React.Key>(
				query.trim() && filteredNavItems
					? collectParentIds(filteredNavItems)
					: (sections ?? []).map(({id}) => id)
			),
		[filteredNavItems, query, sections]
	);

	const content = (
		<>
			<nav
				aria-label={ariaLabel ?? title}
				className={classNames('unified-navigation-sidebar', {
					'unified-navigation-sidebar-clipped-bottom':
						clipped.bottom,
					'unified-navigation-sidebar-clipped-top': clipped.top,
					'unified-navigation-sidebar-mobile': isMobile,
					'unified-navigation-sidebar-open': open,
					'unified-navigation-sidebar-peek': peek && !pinned,
				})}
				data-qa-id="unifiedNavigationSidebar"
				id={`${navigationId}-unified-sidebar`}
				onMouseEnter={() => startPeek(navigationId)}
				onMouseLeave={() => stopPeek(navigationId)}
				{...(!open && {inert: ''})}
			>
				<div className="unified-navigation-sidebar-header">
					<span className="unified-navigation-sidebar-title">
						{title}
					</span>

					{headerSlot && (
						<Slot
							className="unified-navigation-slot"
							content={headerSlot}
						/>
					)}

					{colorSchemeToggle && <UnifiedColorSchemeButton />}
				</div>

				{(bodyTopSlot || searchable) && (
					<div className="unified-navigation-sidebar-search">
						{searchable && (
							<div className="unified-navigation-search">
								<ClayIcon
									className="unified-navigation-search-icon"
									symbol="search"
								/>

								<input
									aria-label={Liferay.Language.get('search')}
									className="form-control"
									onChange={(event) =>
										setQuery(event.target.value)
									}
									placeholder={Liferay.Language.get('search')}
									type="search"
									value={query}
								/>
							</div>
						)}

						{bodyTopSlot && (
							<Slot
								className="unified-navigation-slot"
								content={bodyTopSlot}
							/>
						)}
					</div>
				)}

				<div
					className="unified-navigation-sidebar-body"
					onScroll={updateClipped}
					ref={bodyRef}
				>
					{filteredNavItems && !filteredNavItems.length && (
						<p className="c-px-3 text-secondary unified-navigation-empty">
							{Liferay.Language.get('no-matching-items')}
						</p>
					)}

					{!!filteredNavItems?.length && (
						<VerticalNav
							active={active}
							aria-label={ariaLabel ?? title}
							defaultExpandedKeys={expandedKeys}
							displayType="primary"
							items={filteredNavItems}
							key={query.trim() ? `filter-${query}` : 'all'}
							stacked
						>
							{(item: VerticalNavItem) => (
								<VerticalNav.Item
									href={item.href}
									items={item.items}
									key={item.id}
									textValue={item.label}
								>
									{item.section ? (
										<span className="unified-navigation-section-label">
											{item.label}
										</span>
									) : (
										<>
											{item.icon && (
												<ClayIcon
													className="c-mr-2"
													symbol={item.icon}
												/>
											)}

											{item.label}
										</>
									)}
								</VerticalNav.Item>
							)}
						</VerticalNav>
					)}

					{children}

					{bodySlots?.map((bodySlot, index) => (
						<Slot
							className="unified-navigation-slot"
							content={bodySlot}
							key={index}
						/>
					))}
				</div>

				{(userMenu || userMenuSlot) && (
					<div className="unified-navigation-sidebar-footer">
						{userMenu ? (
							<UnifiedUserMenu {...userMenu} />
						) : (
							<Slot
								className="unified-navigation-slot"
								content={userMenuSlot}
							/>
						)}
					</div>
				)}
			</nav>

			{isMobile && pinned && (
				<div
					className="unified-navigation-backdrop"
					onClick={() => setState({pinned: false})}
				/>
			)}
		</>
	);

	const withSpritemap = (
		<ClayIconSpriteContext.Provider
			value={spritemap ?? Liferay.Icons.spritemap}
		>
			{content}
		</ClayIconSpriteContext.Provider>
	);

	if (linkComponent) {
		return (
			<ClayLinkContext.Provider value={linkComponent}>
				{withSpritemap}
			</ClayLinkContext.Provider>
		);
	}

	return withSpritemap;
}
