/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export {default as UnifiedSidebar} from './UnifiedSidebar';
export {default as UnifiedSidebarToggle} from './UnifiedSidebarToggle';
export {default as UnifiedTopBar} from './UnifiedTopBar';
export {
	getNavigationState,
	setNavigationState,
	useNavigationState,
} from './store';

export type {SlotContent} from './Slot';
export type {UnifiedSidebarProps} from './UnifiedSidebar';
export type {UnifiedTopBarProps} from './UnifiedTopBar';
export type {
	NavigationItem,
	NavigationSection,
	Persistence,
	UserMenu,
	UserMenuItem,
} from './types';
