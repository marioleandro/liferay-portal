/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import classNames from 'classnames';
import React, {useState} from 'react';
import {createPortal} from 'react-dom';

import {startPeek, stopPeek, useNavigationState} from './store';

interface Props {
	className?: string;
	environmentIcon?: string;
	navigationId: string;
}

/**
 * One static button that never moves and changes only its content, as in the
 * prototype. Closed, it shows the menu icon. While the panel is peeked, it
 * shows the product icon the sidebar published, and the menu icon again on
 * hover or focus. Pinned, it shows the menu icon on a soft tint.
 */
export default function UnifiedSidebarToggle({
	className,
	environmentIcon,
	navigationId,
}: Props) {
	const [{brandIcon, brandIconColor, brandImageURL, peek, pinned}, setState] =
		useNavigationState(navigationId);

	const [pointed, setPointed] = useState(false);

	const label = pinned
		? Liferay.Language.get('close-product-menu')
		: Liferay.Language.get('open-product-menu');

	const icon = brandIcon ?? environmentIcon;

	const showBrand = peek && !pinned && !pointed && (brandImageURL || icon);

	// The toggle paints above the panel, so it can't live inside a host's
	// stacking context (the DXP Control Menu creates one).

	return createPortal(
		<button
			aria-controls={`${navigationId}-unified-sidebar`}
			aria-expanded={pinned}
			aria-label={label}
			className={classNames(
				'btn btn-unstyled unified-navigation-toggle',
				{'unified-navigation-toggle-pinned': pinned},
				className
			)}
			data-qa-id="unifiedNavigationToggle"
			onBlur={() => setPointed(false)}
			onClick={() => setState({peek: false, pinned: !pinned})}
			onFocus={() => setPointed(true)}
			onMouseEnter={() => {
				setPointed(true);

				startPeek(navigationId);
			}}
			onMouseLeave={() => {
				setPointed(false);

				stopPeek(navigationId);
			}}
			title={label}
			type="button"
		>
			{showBrand ? (
				<span
					className="unified-navigation-toggle-brand"
					style={{color: brandIconColor}}
				>
					{brandImageURL ? (
						<img alt="" src={brandImageURL} />
					) : (
						<ClayIcon symbol={icon!} />
					)}
				</span>
			) : (
				<ClayIcon
					symbol={pinned ? 'product-menu-open' : 'product-menu-closed'}
				/>
			)}
		</button>,
		document.body
	);
}
