/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import hideProductMenuIfPresent from '../../src/main/resources/META-INF/resources/js/utils/hideProductMenuIfPresent';

function getStateChangedHandler() {
	const [, handler] = (Liferay.on as jest.Mock).mock.calls.find(
		([eventName]) => eventName === 'productMenuSidebarStateChanged'
	);

	return handler;
}

describe('hideProductMenuIfPresent', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		document.body.className = '';
	});

	it('hides when there is no product menu', () => {
		const onHide = jest.fn();

		hideProductMenuIfPresent({onHide});

		expect(onHide).toHaveBeenCalledTimes(1);
		expect(Liferay.fire).not.toHaveBeenCalled();
	});

	it('hides right away when the sidebar is closed', () => {
		document.body.classList.add('product-menu-unified-sidebar');

		const onHide = jest.fn();

		hideProductMenuIfPresent({onHide});

		expect(onHide).toHaveBeenCalledTimes(1);
		expect(Liferay.fire).not.toHaveBeenCalled();
	});

	it('closes the open sidebar before hiding', () => {
		document.body.classList.add(
			'product-menu-open',
			'product-menu-unified-sidebar'
		);

		const onHide = jest.fn();

		hideProductMenuIfPresent({onHide});

		expect(Liferay.fire).toHaveBeenCalledWith(
			'productMenuSidebarStateRequested',
			{visible: false}
		);
		expect(onHide).not.toHaveBeenCalled();

		const handleStateChanged = getStateChangedHandler();

		handleStateChanged({visible: true});

		expect(Liferay.fire).toHaveBeenCalledTimes(2);
		expect(onHide).not.toHaveBeenCalled();

		handleStateChanged({visible: false});

		expect(onHide).toHaveBeenCalledTimes(1);
		expect(Liferay.detach).toHaveBeenCalledWith(
			'productMenuSidebarStateChanged',
			handleStateChanged
		);
	});
});
