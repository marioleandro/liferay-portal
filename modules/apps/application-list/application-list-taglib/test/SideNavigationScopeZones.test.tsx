/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {configure} from '@testing-library/dom';
import {render, screen, within} from '@testing-library/react';
import React from 'react';

import {SideNavigation} from '../src/main/resources/META-INF/resources/js';
import {SideNavigationItem} from '../src/main/resources/META-INF/resources/js/types/SideNavigation';

configure({
	testIdAttribute: 'data-qa-id',
});

const app = (
	id: string,
	label: string,
	scope: 'instance' | 'system'
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
	scope: 'instance' | 'system'
): SideNavigationItem => ({
	id,
	items: [app(`${id}_child`, `${label} Child`, scope)],
	label,
	scope,
});

/**
 * The payload SideNavigationDisplayContext emits for the Control Panel once
 * the two root scopes exist. Home carries no scope, each marker opens a zone,
 * and every item after a marker carries that zone's scope until the next one.
 */
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
	app('app_manager', 'App Manager', 'system'),
	app('gogo_shell', 'Gogo Shell', 'system'),
	app('portal_instances', 'Virtual Instances', 'system'),
	app('on_demand_admin', 'On-Demand Admin', 'system'),
	{
		id: 'control_panel.configuration',
		label: 'Instance: Liferay',
		scope: 'instance',
		scopeMarker: true,
	},
	app('system_settings', 'System Settings', 'instance'),
	app('instance_settings', 'Instance Settings', 'instance'),
	app('custom_fields', 'Custom Fields', 'instance'),
	app('countries', 'Countries', 'instance'),
	category('control_panel.users', 'Users', 'instance'),
	category('control_panel.sites', 'Sites', 'instance'),
];

const renderControlPanel = ({selectedPortletId = 'server_admin'} = {}) =>
	render(
		<SideNavigation
			canonicalName="Control Panel"
			categoryImageUrl="categoryImageUrl"
			colorScheme="light"
			colorSchemeSessionKey="colorSchemeSessionKey"
			expandedKeys={['control_panel.users', 'control_panel.sites']}
			expandedKeysSessionKey="expandedKeysSessionKey"
			items={CONTROL_PANEL_ITEMS}
			label="Control Panel"
			navigationItemsURL="navigationItemsURL"
			selectedPortletId={selectedPortletId}
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

	it('keeps a category below a marker collapsible', () => {
		renderControlPanel();

		expect(screen.getByText('Users')).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	});

	it('tints an item with the zone it sits in', () => {
		renderControlPanel();

		expect(
			screen.getByText('Server Administration').parentElement
		).toHaveClass('side-navigation-scope-zone-system');

		expect(screen.getByText('Instance Settings').parentElement).toHaveClass(
			'side-navigation-scope-zone-instance'
		);
	});

	it('leaves Home outside both zones', () => {
		renderControlPanel();

		const homeItem = screen.getByText('Home').parentElement;

		expect(homeItem).not.toHaveClass('side-navigation-scope-zone-instance');
		expect(homeItem).not.toHaveClass('side-navigation-scope-zone-system');
	});

	it('describes an item by the marker of its zone', () => {
		renderControlPanel();

		expect(screen.getByText('Gogo Shell')).toHaveAccessibleDescription(
			'System'
		);

		expect(screen.getByText('Countries')).toHaveAccessibleDescription(
			'Instance: Liferay'
		);
	});

	it('carries the zone into a category nested below its marker', () => {
		renderControlPanel();

		expect(screen.getByText('Users Child').parentElement).toHaveClass(
			'side-navigation-scope-zone-instance'
		);
	});
});
