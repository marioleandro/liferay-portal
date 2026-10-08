/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export interface NavigationItem {
	href?: string;
	icon?: string;
	id: string;
	items?: NavigationItem[];
	label: string;
}

export interface NavigationSection {
	id: string;
	items: NavigationItem[];
	label?: string;
}

export interface Persistence {
	key: string;
	type: 'local' | 'session';
}

/**
 * The shape of DXP's personal menu items (Clay drop-down items), so DXP can
 * pass its items URL as is.
 */
export interface UserMenuItem {
	href?: string;
	items?: UserMenuItem[];
	jsOnClickConfig?: unknown;
	label?: string;
	onClick?: () => void;
	onClickESModule?: string;
	symbol?: string;
	symbolRight?: string;
	type?: 'divider' | 'group' | 'item';
}

export interface UserMenu {
	items?: UserMenuItem[];
	itemsURL?: string;
	name: string;
	portraitURL?: string;
}
