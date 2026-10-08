/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import ClayLink from '@clayui/link';
import ClaySticker from '@clayui/sticker';
import classNames from 'classnames';
import {fetch, loadModule} from 'frontend-js-web';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import type {UserMenu, UserMenuItem} from './types';

function getInitials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join('');
}

function MenuItem({
	item,
	onSelect,
}: {
	item: UserMenuItem;
	onSelect: () => void;
}) {
	if (item.type === 'divider') {
		return <li className="dropdown-divider" role="separator" />;
	}

	if (item.type === 'group') {
		return (
			<>
				{item.label && (
					<li
						className="dropdown-subheader"
						role="presentation"
					>
						{item.label}
					</li>
				)}

				{item.items?.map((childItem, index) => (
					<MenuItem
						item={childItem}
						key={index}
						onSelect={onSelect}
					/>
				))}
			</>
		);
	}

	const content = (
		<>
			<span className="dropdown-item-text-truncate">{item.label}</span>

			{(item.symbolRight || item.symbol) && (
				<ClayIcon
					className="unified-navigation-user-menu-item-icon"
					symbol={(item.symbolRight || item.symbol)!}
				/>
			)}
		</>
	);

	const handleClick = () => {
		onSelect();

		if (item.onClickESModule) {
			loadModule(item.onClickESModule).then((onClick: Function) =>
				onClick(item.jsOnClickConfig)
			);
		}
		else {
			item.onClick?.();
		}
	};

	return (
		<li role="none">
			{item.href ? (
				<ClayLink
					className="dropdown-item unified-navigation-user-menu-item"
					href={item.href}
					onClick={handleClick}
					role="menuitem"
				>
					{content}
				</ClayLink>
			) : (
				<button
					className="dropdown-item unified-navigation-user-menu-item"
					onClick={handleClick}
					role="menuitem"
					type="button"
				>
					{content}
				</button>
			)}
		</li>
	);
}

/**
 * The prototype's pinned footer: a borderless trigger with the portrait, the
 * name and a caret, opening the user menu upward across the panel. Hosts pass
 * the items, or the URL DXP's personal menu loads them from.
 *
 * It avoids @clayui/drop-down on purpose: modules link Clay by export name,
 * and that package gained exports after the DXP releases some products build
 * on, so importing it would keep the component from loading there.
 */
export default function UnifiedUserMenu({
	items: externalItems,
	itemsURL,
	name,
	portraitURL,
}: UserMenu) {
	const [items, setItems] = useState<UserMenuItem[] | undefined>(
		externalItems
	);

	const [open, setOpen] = useState(false);

	const ref = useRef<HTMLDivElement>(null);

	const requestedRef = useRef(false);

	const loadItems = useCallback(() => {
		if (!itemsURL || requestedRef.current) {
			return;
		}

		requestedRef.current = true;

		fetch(itemsURL)
			.then((response: Response) => response.json())
			.then(setItems)
			.catch(() => {
				requestedRef.current = false;
			});
	}, [itemsURL]);

	useEffect(() => {
		if (!open) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (!ref.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setOpen(false);
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('pointerdown', handlePointerDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [open]);

	return (
		<div
			className={classNames('unified-navigation-user-menu', {
				'unified-navigation-user-menu-open': open,
			})}
			ref={ref}
		>
			{open && (
				<ul
					className="dropdown-menu show unified-navigation-user-menu-list"
					role="menu"
				>
					{!itemsURL && (
						<li className="dropdown-subheader" role="presentation">
							{name}
						</li>
					)}

					{items ? (
						items.map((item, index) => (
							<MenuItem
								item={item}
								key={index}
								onSelect={() => setOpen(false)}
							/>
						))
					) : (
						<li className="dropdown-item" role="presentation">
							<span className="loading-animation loading-animation-sm" />
						</li>
					)}
				</ul>
			)}

			<button
				aria-expanded={open}
				aria-haspopup="true"
				className="unified-navigation-user"
				data-qa-id="unifiedNavigationUserMenu"
				onClick={() => {
					loadItems();

					setOpen(!open);
				}}
				onFocus={loadItems}
				onMouseEnter={loadItems}
				type="button"
			>
				<ClaySticker
					className="unified-navigation-user-avatar"
					displayType="secondary"
					shape="circle"
					size="sm"
				>
					{portraitURL ? (
						<img alt="" className="sticker-img" src={portraitURL} />
					) : (
						getInitials(name)
					)}
				</ClaySticker>

				<span className="unified-navigation-user-name">{name}</span>

				<ClayIcon
					className="unified-navigation-user-caret"
					symbol="caret-bottom"
				/>
			</button>
		</div>
	);
}
