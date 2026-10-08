/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useCallback, useSyncExternalStore} from 'react';

export interface NavigationState {
	brandIcon?: string;
	brandIconColor?: string;
	brandImageURL?: string;
	peek: boolean;
	pinned: boolean;
}

const DEFAULT_STATE: NavigationState = {peek: false, pinned: true};

const PEEK_GRACE_PERIOD = 250;

const listeners = new Map<string, Set<() => void>>();

const peekTimers = new Map<string, ReturnType<typeof setTimeout>>();

const states = new Map<string, NavigationState>();

export function getNavigationState(navigationId: string): NavigationState {
	return states.get(navigationId) ?? DEFAULT_STATE;
}

/**
 * Seeds the state during the owner's first render without notifying, so other
 * React roots that already read the default state catch up through
 * publishNavigationState once the owner has mounted.
 */
export function initNavigationState(
	navigationId: string,
	state: Partial<NavigationState>
) {
	if (!states.has(navigationId)) {
		states.set(navigationId, {...DEFAULT_STATE, ...state});
	}
}

export function publishNavigationState(navigationId: string) {
	listeners.get(navigationId)?.forEach((listener) => listener());
}

export function setNavigationState(
	navigationId: string,
	update: Partial<NavigationState>
) {
	const state = getNavigationState(navigationId);

	const nextState = {...state, ...update};

	if (
		(Object.keys(nextState) as Array<keyof NavigationState>).every(
			(key) => nextState[key] === state[key]
		)
	) {
		return;
	}

	states.set(navigationId, nextState);

	publishNavigationState(navigationId);
}

export function startPeek(navigationId: string) {
	clearTimeout(peekTimers.get(navigationId));

	if (!getNavigationState(navigationId).pinned) {
		setNavigationState(navigationId, {peek: true});
	}
}

export function stopPeek(navigationId: string, immediate = false) {
	clearTimeout(peekTimers.get(navigationId));

	if (immediate) {
		setNavigationState(navigationId, {peek: false});

		return;
	}

	peekTimers.set(
		navigationId,
		setTimeout(
			() => setNavigationState(navigationId, {peek: false}),
			PEEK_GRACE_PERIOD
		)
	);
}

function subscribe(navigationId: string, listener: () => void) {
	let navigationListeners = listeners.get(navigationId);

	if (!navigationListeners) {
		navigationListeners = new Set();

		listeners.set(navigationId, navigationListeners);
	}

	navigationListeners.add(listener);

	return () => {
		navigationListeners!.delete(listener);
	};
}

export function useNavigationState(
	navigationId: string
): [NavigationState, (update: Partial<NavigationState>) => void] {
	const state = useSyncExternalStore(
		(listener) => subscribe(navigationId, listener),
		() => getNavigationState(navigationId)
	);

	const update = useCallback(
		(update: Partial<NavigationState>) =>
			setNavigationState(navigationId, update),
		[navigationId]
	);

	return [state, update];
}
