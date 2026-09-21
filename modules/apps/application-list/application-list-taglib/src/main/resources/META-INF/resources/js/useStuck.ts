/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useEffect, useState} from 'react';

import {SideNavigationItem} from './types/SideNavigation';

export function useStuck(
	ref: React.RefObject<HTMLDivElement>,
	items: Array<SideNavigationItem>
) {
	const [stuck, setStuck] = useState(false);

	useEffect(() => {
		const root = ref.current?.querySelector('.side-navigation-scroller');

		if (!root) {
			return;
		}

		const update = () => {
			const rootRect = root.getBoundingClientRect();

			setStuck(
				root.scrollTop > 0 &&
					Array.from(
						root.querySelectorAll('.side-navigation-scope-item')
					).some(
						(item) =>
							item.getBoundingClientRect().top <= rootRect.top + 1
					)
			);
		};

		update();

		const resizeObserver = new ResizeObserver(update);

		resizeObserver.observe(root);

		if (root.firstElementChild) {
			resizeObserver.observe(root.firstElementChild);
		}

		root.addEventListener('scroll', update, {passive: true});

		return () => {
			resizeObserver.disconnect();

			root.removeEventListener('scroll', update);
		};
	}, [items, ref]);

	return stuck;
}
