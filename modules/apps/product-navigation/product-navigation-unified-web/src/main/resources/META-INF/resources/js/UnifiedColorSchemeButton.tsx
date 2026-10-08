/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import React, {useState} from 'react';

/**
 * Same session key as DXP's SideNavigationColorSchemeButton, so the choice is
 * shared with the DXP administration, and every theme that reads it sets
 * <html data-color-scheme> on the next page load.
 */
const COLOR_SCHEME_SESSION_KEY =
	'com_liferay_application_list_taglib_SideNavigationColorScheme';

export default function UnifiedColorSchemeButton() {
	const [dark, setDark] = useState(
		() => document.documentElement.dataset.colorScheme === 'dark'
	);

	const label = dark
		? Liferay.Language.get('switch-to-light-mode')
		: Liferay.Language.get('switch-to-dark-mode');

	return (
		<button
			aria-label={label}
			aria-pressed={dark}
			className="btn btn-monospaced btn-sm btn-unstyled unified-navigation-header-action"
			data-qa-id="unifiedNavigationColorSchemeButton"
			onClick={() => {
				const nextDark = !dark;

				document.documentElement.dataset.colorScheme = nextDark
					? 'dark'
					: 'light';

				Liferay.Util.Session.set(
					COLOR_SCHEME_SESSION_KEY,
					nextDark ? 'dark' : 'light'
				);

				setDark(nextDark);
			}}
			title={label}
			type="button"
		>
			<ClayIcon symbol={dark ? 'sun' : 'moon'} />
		</button>
	);
}
