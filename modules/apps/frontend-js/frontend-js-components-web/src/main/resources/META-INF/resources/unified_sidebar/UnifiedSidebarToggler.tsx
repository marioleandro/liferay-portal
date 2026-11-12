/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ClayButtonWithIcon} from '@clayui/button';
import {useEventListener} from '@liferay/frontend-js-react-web';
import React, {useEffect, useMemo, useRef, useState} from 'react';

const SETTLE_TIMEOUT = 500;

interface Props {
	navigationId: string;
	stateChangedEventName: string;
	stateRequestedEventName: string;
	visible: boolean;
}

function isTypingTarget(target: EventTarget | undefined) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
		return true;
	}

	const editable = target.closest('[contenteditable]');

	return !!editable && editable.getAttribute('contenteditable') !== 'false';
}

function UnifiedSidebarToggler({
	navigationId,
	stateChangedEventName,
	stateRequestedEventName,
	visible: initialVisible,
}: Props) {
	const [visible, setVisible] = useState(initialVisible);

	async function toggle() {
		Liferay.fire(stateRequestedEventName, {visible: !visible});
	}

	const shouldFocusRef = useRef(false);

	useEffect(() => {
		function handleStateChanged({visible}: {visible: boolean}) {
			shouldFocusRef.current =
				!visible &&
				!!document
					.getElementById(navigationId)
					?.contains(document.activeElement);

			setVisible(visible);
		}

		Liferay.on(stateChangedEventName, handleStateChanged);

		// The navigation can change its state on load, for example when it
		// starts closed on a narrow screen or a page editor closes it, before
		// this toggler subscribes, so read its current state as well.

		const navigation = document.getElementById(navigationId);

		if (navigation) {
			setVisible(navigation.classList.contains('c-slideout-show'));
		}

		return () => Liferay.detach(stateChangedEventName, handleStateChanged);
	}, [navigationId, stateChangedEventName]);

	const shouldAnnounceRef = useRef(false);

	const [announcement, setAnnouncement] = useState('');

	useEffect(() => {
		if (shouldAnnounceRef.current) {
			shouldAnnounceRef.current = false;

			setAnnouncement(
				visible
					? Liferay.Language.get('the-product-menu-is-open')
					: Liferay.Language.get('the-product-menu-is-closed')
			);
		}
		else {
			setAnnouncement('');
		}
	}, [visible]);

	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (visible) {
			return;
		}

		// Keep keyboard users in place when the navigation hides with focus
		// inside it. The side panel may also return focus to this toggler
		// while it still moves, so wait for it to settle and focus it again,
		// which aligns its tooltip with where it ends up.

		const button = buttonRef.current;

		if (!button) {
			return;
		}

		let frameId: number;
		let left = button.getBoundingClientRect().left;
		let stableFrames = 0;

		const start = performance.now();

		const focusWhenSettled = () => {
			const currentLeft = button.getBoundingClientRect().left;

			stableFrames = currentLeft === left ? stableFrames + 1 : 0;

			left = currentLeft;

			if (
				stableFrames >= 2 ||
				performance.now() - start > SETTLE_TIMEOUT
			) {
				if (
					shouldFocusRef.current ||
					document.activeElement === button
				) {
					shouldFocusRef.current = false;

					button.blur();
					button.focus();
				}

				return;
			}

			frameId = requestAnimationFrame(focusWhenSettled);
		};

		frameId = requestAnimationFrame(focusWhenSettled);

		return () => cancelAnimationFrame(frameId);
	}, [visible]);

	useEventListener(
		'keydown',
		(event) => {
			const {altKey, code, ctrlKey, metaKey, repeat, shiftKey} =
				event as KeyboardEvent;

			if (
				!altKey ||
				code !== 'KeyM' ||
				!ctrlKey ||
				metaKey ||
				repeat ||
				shiftKey ||
				isTypingTarget(event.composedPath()[0]) ||
				!document.getElementById(navigationId)
			) {
				return;
			}

			event.preventDefault();

			shouldAnnounceRef.current = true;

			toggle();
		},
		true,
		document
	);

	const title = useMemo(
		() =>
			visible
				? Liferay.Language.get('close-product-menu')
				: Liferay.Language.get('open-product-menu'),
		[visible]
	);

	return (
		<>
			<ClayButtonWithIcon
				aria-controls={navigationId}
				aria-expanded={visible}
				aria-keyshortcuts="Control+Alt+M"
				aria-label={title}
				className="control-menu-nav-link"
				data-qa-id="sideNavigationToggler"
				displayType="unstyled"
				monospaced
				onClick={toggle}
				ref={buttonRef}
				role="tab"
				size="sm"
				symbol={visible ? 'product-menu-open' : 'product-menu-closed'}
				title={title}
			/>

			<span aria-live="polite" className="sr-only">
				{announcement}
			</span>
		</>
	);
}

export default UnifiedSidebarToggler;
