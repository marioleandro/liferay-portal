/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {act} from '@testing-library/react';

type Observation = {callback: () => void; target: Element};

export default function mockResizeObserver(): {
	resize: (selector: string) => void;
} {
	let observations: Array<Observation> = [];

	beforeEach(() => {
		observations = [];

		(window as any).ResizeObserver = function (callback: () => void) {
			return {
				disconnect: () => {
					observations = observations.filter(
						(observation) => observation.callback !== callback
					);
				},
				observe: (target: Element) =>
					observations.push({callback, target}),
			};
		};
	});

	afterEach(() => {
		delete (window as any).ResizeObserver;
	});

	return {
		resize: (selector: string) =>
			observations
				.filter((observation) => observation.target.matches(selector))
				.forEach((observation) => act(() => observation.callback())),
	};
}
