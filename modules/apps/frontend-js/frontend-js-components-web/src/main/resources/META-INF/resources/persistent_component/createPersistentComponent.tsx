/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Provider} from '@clayui/core';
import {
	ClayIconIllustrationSpriteContext,
	ClayIconSpriteContext,
} from '@clayui/icon';
import React, {useLayoutEffect, useRef} from 'react';
import {Root, createRoot} from 'react-dom/client';

type PersistentRoot = {
	element: HTMLElement;
	persistentKey: string;
	root: Root;
	scrollPositions: Map<Element, number>;
};

// SPA navigation replaces the whole page and remounts every component in it.
// A persistent component lives in a root of its own that survives navigation,
// and each page only hands that root its new props.
//
// The container must have an id and a data-persistent-key attribute. Pages
// with the same container id and key share the instance, and a page with a
// different key, or without the container, drops it.

const persistentRoots = new Map<string, PersistentRoot>();

let listening = false;

function getPersistentRoot(containerId: string, persistentKey: string) {
	const persistentRoot = persistentRoots.get(containerId);

	if (persistentRoot?.persistentKey === persistentKey) {
		return persistentRoot;
	}

	unmountPersistentRoot(containerId);

	const element = document.createElement('div');

	const scrollPositions = new Map<Element, number>();

	// Taking the element out of the page resets its scroll, so keep track of
	// it to restore it on the next page.

	element.addEventListener(
		'scroll',
		(event) => {
			const target = event.target as Element;

			scrollPositions.set(target, target.scrollTop);
		},
		true
	);

	const newPersistentRoot = {
		element,
		persistentKey,
		root: createRoot(element),
		scrollPositions,
	};

	persistentRoots.set(containerId, newPersistentRoot);

	return newPersistentRoot;
}

function restoreScrollPositions({scrollPositions}: PersistentRoot) {
	scrollPositions.forEach((scrollTop, element) => {
		element.scrollTop = scrollTop;
	});
}

function unmountPersistentRoot(containerId: string) {
	const persistentRoot = persistentRoots.get(containerId);

	if (!persistentRoot) {
		return;
	}

	persistentRoot.root.unmount();
	persistentRoot.element.remove();

	persistentRoots.delete(containerId);
}

// Show each instance in its container as soon as the new page is on screen,
// in place of the container skeleton, so the skeleton never shows.

function onScreenFlip() {
	persistentRoots.forEach((persistentRoot, containerId) => {
		const container = document.getElementById(containerId);

		if (
			container?.dataset.persistentKey !== persistentRoot.persistentKey
		) {
			unmountPersistentRoot(containerId);

			return;
		}

		container
			.querySelectorAll(':scope > [data-persistent-skeleton]')
			.forEach((skeleton) => skeleton.remove());

		container.prepend(persistentRoot.element);

		restoreScrollPositions(persistentRoot);
	});
}

export default function createPersistentComponent<Props extends object>(
	Component: React.ComponentType<Props>
) {
	function PersistentComponent(props: Props) {
		const ref = useRef<HTMLDivElement>(null);
		const containerIdRef = useRef('');

		useLayoutEffect(() => {
			const element = ref.current!;

			const container = element.closest<HTMLElement>(
				'[data-persistent-key]'
			);

			if (!container?.id) {
				throw new Error(
					'A persistent component needs a container with an id and a data-persistent-key attribute'
				);
			}

			if (!listening) {
				Liferay.on('screenFlip', onScreenFlip);

				listening = true;
			}

			containerIdRef.current = container.id;

			const persistentRoot = getPersistentRoot(
				container.id,
				container.dataset.persistentKey!
			);

			element.appendChild(persistentRoot.element);

			restoreScrollPositions(persistentRoot);

			// This component unmounts before the page is replaced, so keep
			// the instance on screen until the new page takes it.

			return () => {
				container.appendChild(persistentRoot.element);

				restoreScrollPositions(persistentRoot);
			};
		}, []);

		useLayoutEffect(() => {
			persistentRoots.get(containerIdRef.current)?.root.render(
				<Provider spritemap={Liferay.Icons.spritemap}>
					<ClayIconSpriteContext.Provider
						value={Liferay.Icons.spritemap}
					>
						<ClayIconIllustrationSpriteContext.Provider
							value={Liferay.ThemeDisplay.getPathThemeEmptyStatesSpritemap()}
						>
							<Component {...props} />
						</ClayIconIllustrationSpriteContext.Provider>
					</ClayIconSpriteContext.Provider>
				</Provider>
			);
		}, [props]);

		return <div ref={ref} />;
	}

	PersistentComponent.displayName = `Persistent(${
		Component.displayName || Component.name
	})`;

	return PersistentComponent;
}
