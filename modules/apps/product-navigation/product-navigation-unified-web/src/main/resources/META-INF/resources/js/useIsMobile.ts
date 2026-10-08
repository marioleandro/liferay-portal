/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useSyncExternalStore} from 'react';

const MOBILE_QUERY = '(max-width: 767.98px)';

export default function useIsMobile() {
	return useSyncExternalStore(
		(listener) => {
			const mediaQueryList = window.matchMedia(MOBILE_QUERY);

			mediaQueryList.addEventListener('change', listener);

			return () => mediaQueryList.removeEventListener('change', listener);
		},
		() => window.matchMedia(MOBILE_QUERY).matches
	);
}
