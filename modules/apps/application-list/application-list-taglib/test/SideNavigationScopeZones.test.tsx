/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {configure} from '@testing-library/dom';
import {render, screen, within} from '@testing-library/react';
import React from 'react';

import {SideNavigation} from '../src/main/resources/META-INF/resources/js';
import {
	SideNavigationItem,
	SideNavigationScope,
} from '../src/main/resources/META-INF/resources/js/types/SideNavigation';

configure({
	testIdAttribute: 'data-qa-id',
});

const app = (
	id: string,
	label: string,
	scope: SideNavigationScope
): SideNavigationItem => ({
	canonicalName: label,
	href: `/group/control_panel/manage?p_p_id=${id}`,
	id,
	label,
	leadingIcon: 'cog',
	scope,
});

const category = (
	id: string,
	label: string,
	scope: SideNavigationScope
): SideNavigationItem => ({
	id,
	items: [app(`${id}_child`, `${label} Child`, scope)],
	label,
	scope,
});

const CONTROL_PANEL_ITEMS: Array<SideNavigationItem> = [
	{
		canonicalName: 'Home',
		href: '/group/control_panel',
		id: 'com_liferay_product_navigation_applications_menu_web_portlet_ControlPanelHomePortlet',
		label: 'Home',
	},
	{
		id: 'control_panel.system',
		label: 'System',
		scope: 'system',
		scopeMarker: true,
	},
	app('server_admin', 'Server Administration', 'system'),
	app('gogo_shell', 'Gogo Shell', 'system'),
	{
		id: 'control_panel.instance',
		label: 'Instance: Liferay',
		scope: 'instance',
		scopeMarker: true,
	},
	app('instance_settings', 'Instance Settings', 'instance'),
	app('countries', 'Countries', 'instance'),
	category('control_panel.users', 'Users', 'instance'),
];

const renderControlPanel = () =>
	render(
		<SideNavigation
			canonicalName="Control Panel"
			categoryImageUrl="categoryImageUrl"
			colorScheme="light"
			colorSchemeSessionKey="colorSchemeSessionKey"
			expandedKeys={['control_panel.users']}
			expandedKeysSessionKey="expandedKeysSessionKey"
			items={CONTROL_PANEL_ITEMS}
			label="Control Panel"
			navigationItemsURL="navigationItemsURL"
			selectedPortletId="server_admin"
			siteAdministrationItemSelectedEventName="siteAdministrationItemSelectedEventName"
			siteAdministrationItemSelectorUrl="siteAdministrationItemSelectorUrl"
			visible
			visibleSessionKey="visibleSessionKey"
		/>
	);

describe('SideNavigation scope zones', () => {
	it('opens one zone per scope marker', () => {
		renderControlPanel();

		const scopeItems = screen.getAllByTestId('sideNavigationScopeItem');

		expect(scopeItems.map((scopeItem) => scopeItem.textContent)).toEqual([
			'System',
			'Instance: Liferay',
		]);
	});

	it('gives a scope marker no expander', () => {
		renderControlPanel();

		screen
			.getAllByTestId('sideNavigationScopeItem')
			.forEach((scopeItem) => {
				expect(within(scopeItem).queryByRole('button')).toBeNull();
				expect(scopeItem).not.toHaveAttribute('aria-expanded');
			});
	});

	it('flattens the applications of a scope into its zone', () => {
		renderControlPanel();

		expect(screen.getByText('Server Administration')).not.toHaveAttribute(
			'aria-expanded'
		);

		expect(screen.getByText('Instance Settings')).not.toHaveAttribute(
			'aria-expanded'
		);
	});

	it('keeps a category below a marker collapsible', () => {
		renderControlPanel();

		expect(screen.getByText('Users')).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	});

	it('carries the zone into a category nested below its marker', () => {
		renderControlPanel();

		expect(screen.getByText('Users Child').parentElement).toHaveClass(
			'side-navigation-scope-zone-instance'
		);
	});
});
