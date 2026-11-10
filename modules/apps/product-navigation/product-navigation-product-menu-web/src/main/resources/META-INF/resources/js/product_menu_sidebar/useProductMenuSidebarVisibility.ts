/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useMediaQuery} from '@liferay/layout-js-components-web';
import {useCallback, useEffect, useRef, useState} from 'react';

const OVERLAY_MEDIA_QUERY = '(max-width: 991.98px)';
const TRANSITION_TIMEOUT = 300;

export function useProductMenuSidebarVisibility(
	initialVisible: boolean,
	visibleSessionKey: string
) {
	const [closedAsOverlay] = useState(
		() => initialVisible && window.matchMedia(OVERLAY_MEDIA_QUERY).matches
	);

	const [visible, setVisible] = useState(initialVisible && !closedAsOverlay);

	const overlay = useMediaQuery(OVERLAY_MEDIA_QUERY);

	const transitionControllerRef = useRef<AbortController | null>(null);

	const updateVisible = useCallback(
		async (visible: boolean) => {
			await Liferay.Util.Session.set(
				visibleSessionKey,
				visible ? 'open' : 'closed'
			);

			transitionControllerRef.current?.abort();

			const transitionController = new AbortController();

			transitionControllerRef.current = transitionController;

			const {body} = document;

			const endTransition = () => {
				body.classList.remove('sidenav-transition');

				transitionController.abort();
			};

			body.addEventListener(
				'transitionend',
				(event) => {
					if (
						event.propertyName === 'padding-left' &&
						(event.target as HTMLElement).id === 'wrapper'
					) {
						endTransition();
					}
				},
				{signal: transitionController.signal}
			);

			const timeoutId = setTimeout(endTransition, TRANSITION_TIMEOUT);

			transitionController.signal.addEventListener('abort', () =>
				clearTimeout(timeoutId)
			);

			body.classList.add('sidenav-transition');
			body.classList.toggle('open', visible);
			body.classList.toggle('product-menu-open', visible);

			setVisible(visible);

			Liferay.fire('productMenuSidebarStateChanged', {visible});
		},
		[visibleSessionKey]
	);

	useEffect(function cleanupTransition() {
		return () => {
			transitionControllerRef.current?.abort();

			document.body.classList.remove('sidenav-transition');
		};
	}, []);

	useEffect(
		function setupVisibilityRequestHandler() {
			async function handleStateRequest({visible}: {visible: boolean}) {
				await updateVisible(visible);
			}

			Liferay.on('productMenuSidebarStateRequested', handleStateRequest);

			return () =>
				Liferay.detach(
					'productMenuSidebarStateRequested',
					handleStateRequest
				);
		},
		[updateVisible]
	);

	useEffect(
		function announceStateOnLoad() {

			// Announce the state once requests are handled, so a request fired
			// before the sidebar subscribed can be fired again.

			if (closedAsOverlay) {
				document.body.classList.remove('open', 'product-menu-open');
			}

			Liferay.fire('productMenuSidebarStateChanged', {
				visible: initialVisible && !closedAsOverlay,
			});
		},
		[closedAsOverlay, initialVisible]
	);

	return {overlay, updateVisible, visible};
}
