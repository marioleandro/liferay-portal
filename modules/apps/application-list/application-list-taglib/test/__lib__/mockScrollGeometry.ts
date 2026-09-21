/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {act} from '@testing-library/react';

export default function mockScrollGeometry(resizeObserver: {
	resize: (selector: string) => void;
}): {
	place: (tops: Record<string, number>) => void;
	resizeContent: () => void;
	resizePanel: () => void;
	scroll: (scrollTop: number) => void;
} {
	let tops: Record<string, number> = {};

	beforeEach(() => {
		tops = {};

		jest.spyOn(
			Element.prototype,
			'getBoundingClientRect'
		).mockImplementation(function (this: Element) {
			const match = Object.entries(tops).find(([selector]) =>
				this.matches(selector)
			);

			return {top: match ? match[1] : 0} as DOMRect;
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	return {
		place: (placed: Record<string, number>) => {
			tops = {...tops, ...placed};
		},

		resizeContent: () => resizeObserver.resize('.menubar'),

		resizePanel: () => resizeObserver.resize('.side-navigation-scroller'),

		scroll: (scrollTop: number) => {
			const root = document.querySelector('.side-navigation-scroller');

			if (!root) {
				throw new Error(
					'There is no ".side-navigation-scroller" yet. Render the panel ' +
						'before scrolling it.'
				);
			}

			root.scrollTop = scrollTop;

			act(() => {
				root.dispatchEvent(new Event('scroll'));
			});
		},
	};
}
