/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon, {ClayIconSpriteContext} from '@clayui/icon';
import classNames from 'classnames';
import React from 'react';

import Slot, {SlotContent} from './Slot';
import UnifiedSidebarToggle from './UnifiedSidebarToggle';
import {useNavigationState} from './store';
import useIsMobile from './useIsMobile';

import '../css/UnifiedNavigation.scss';

export interface UnifiedTopBarProps {
	actions?: SlotContent[];
	back?: {href?: string; label: string; onClick?: () => void};
	environmentIcon?: string;

	/**
	 * The product logo, shown before the title when there is no sidebar to
	 * carry it on its toggle.
	 */
	icon?: string;
	iconColor?: string;
	imageURL?: string;
	navigationId: string;
	sidebar?: boolean;
	spritemap?: string;
	title: string;
}

export default function UnifiedTopBar({
	actions,
	back,
	environmentIcon,
	icon,
	iconColor,
	imageURL,
	navigationId,
	sidebar = true,
	spritemap,
	title,
}: UnifiedTopBarProps) {
	const [{pinned}] = useNavigationState(navigationId);

	const isMobile = useIsMobile();

	return (
		<ClayIconSpriteContext.Provider
			value={spritemap ?? Liferay.Icons.spritemap}
		>
			<header
				className={classNames('unified-navigation-top-bar', {
					'unified-navigation-top-bar-no-sidebar': !sidebar,
					'unified-navigation-top-bar-pinned':
						sidebar && pinned && !isMobile,
				})}
				data-qa-id="unifiedNavigationTopBar"
			>
				{sidebar && (
					<UnifiedSidebarToggle
						environmentIcon={environmentIcon}
						navigationId={navigationId}
					/>
				)}

				{!sidebar && (icon || imageURL) && (
					<span
						className="unified-navigation-toggle-brand"
						style={{color: iconColor}}
					>
						{imageURL ? (
							<img alt="" src={imageURL} />
						) : (
							<ClayIcon symbol={icon!} />
						)}
					</span>
				)}

				{back &&
					(back.href ? (
						<a
							aria-label={back.label}
							className="btn btn-monospaced btn-sm btn-unstyled"
							href={back.href}
							onClick={back.onClick}
							title={back.label}
						>
							<ClayIcon symbol="angle-left" />
						</a>
					) : (
						<button
							aria-label={back.label}
							className="btn btn-monospaced btn-sm btn-unstyled"
							onClick={back.onClick}
							title={back.label}
							type="button"
						>
							<ClayIcon symbol="angle-left" />
						</button>
					))}

				<h1 aria-live="polite" className="unified-navigation-title">
					{title}
				</h1>

				{!!actions?.length && (
					<div className="unified-navigation-actions">
						{actions.map((action, index) => (
							<Slot
								className="unified-navigation-slot"
								content={action}
								key={index}
							/>
						))}
					</div>
				)}
			</header>
		</ClayIconSpriteContext.Provider>
	);
}
