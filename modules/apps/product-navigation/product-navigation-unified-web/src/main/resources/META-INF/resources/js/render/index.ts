/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {render} from '@liferay/frontend-js-react-web';

import {UnifiedSidebar, UnifiedTopBar} from '../index';

import type {UnifiedSidebarProps, UnifiedTopBarProps} from '../index';

/**
 * Entry points for hosts that can't import React components, such as page
 * fragments, which load this file through the page import map. The components
 * are linked from the main entry point, so every host shares one navigation
 * state store.
 */
export function renderUnifiedSidebar(
	container: Element,
	props: UnifiedSidebarProps
) {
	render(UnifiedSidebar, props, container);
}

export function renderUnifiedTopBar(
	container: Element,
	props: UnifiedTopBarProps
) {
	render(UnifiedTopBar, props, container);
}
