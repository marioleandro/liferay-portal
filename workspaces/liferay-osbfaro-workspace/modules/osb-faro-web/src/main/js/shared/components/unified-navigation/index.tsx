import ChannelsMenu, {Channel} from '../channels-menu';
import getSidebarSections from '../sidebar/sections';
import LanguageMenu from '../toolbar/LanguageMenu';
import React, {lazy, Suspense} from 'react';
import RouterLink from 'shared/components/RouterLink';
import {collapseSidebar} from 'shared/actions/sidebar';
import {matchPath} from 'react-router-dom';
import {RootState} from 'shared/store';
import {Routes, toRoute} from 'shared/util/router';
import {useCurrentUser} from 'shared/hooks/useCurrentUser';
import {useDispatch, useSelector} from 'react-redux';
import {useLDPEnabled} from 'shared/hooks/useLDPEnabled';

// The shared navigation is a webpack external the portal serves, so it loads
// lazily for the same reason as the data set (see FrontendDataSet.tsx), and
// only types are imported eagerly.

const UnifiedSidebar = lazy(() =>
	import('@liferay/product-navigation-unified-web').then((module) => ({
		default: module.UnifiedSidebar,
	}))
);

const UnifiedTopBar = lazy(() =>
	import('@liferay/product-navigation-unified-web').then((module) => ({
		default: module.UnifiedTopBar,
	}))
);

const NAVIGATION_ID = 'ldp';

const SPRITEMAP = '/o/osb-faro-web/dist/sprite.svg';

interface IUnifiedNavigationProps {
	activePathname: string;
	channelId?: string;
	channels: Channel[];
	groupId: string;
}

/**
 * LDP's navigation rendered by the shared DXP component. LDP keeps its own
 * menu, property selector, routing and collapsed state, and passes them in.
 */
const UnifiedNavigation: React.FC<IUnifiedNavigationProps> = ({
	activePathname,
	channelId,
	channels,
	groupId,
}) => {
	const currentUser = useCurrentUser();

	const collapsed = useSelector((state: RootState) =>
		state.getIn(['sidebar', String(currentUser.id), 'collapsed'], false)
	);

	const dispatch = useDispatch();

	const LDPEnabled = useLDPEnabled({groupId});

	const sidebarSections = getSidebarSections({
		channelId,
		groupId,
		LDPEnabled,
	});

	const activeItem = sidebarSections
		.flatMap(({items}) => items)
		.find(({route}) =>
			Boolean(matchPath({end: false, path: route}, activePathname))
		);

	const productIcon = LDPEnabled ? 'ldp_logo' : 'ac_logo';

	const productName = LDPEnabled
		? Liferay.Language.get('liferay-data-platform')
		: Liferay.Language.get('analytics-cloud');

	return (
		<Suspense fallback={null}>
			<UnifiedTopBar
				actions={[<LanguageMenu key="language" />]}
				environmentIcon={productIcon}
				navigationId={NAVIGATION_ID}
				spritemap={SPRITEMAP}
				title={activeItem?.label ?? productName}
			/>

			<UnifiedSidebar
				active={activeItem?.id}
				bodyTopSlot={
					<div className="px-3 py-2">
						<ChannelsMenu
							channels={channels}
							defaultChannelId={channelId}
							groupId={groupId}
						/>
					</div>
				}
				colorSchemeToggle
				icon={productIcon}
				linkComponent={RouterLink}
				navigationId={NAVIGATION_ID}
				onPinnedChange={(pinned) =>
					dispatch(
						collapseSidebar({
							collapsed: !pinned,
							currentUserId: currentUser.id,
						})
					)
				}
				pinned={!collapsed}
				searchable
				sections={sidebarSections.map((section) => ({
					id: section.id,
					items: section.items.map((item) => ({
						href: item.url,
						icon: item.icon,
						id: item.id,
						label: item.label,
					})),
					label: section.label,
				}))}
				spritemap={SPRITEMAP}
				title={productName}
				userMenu={{
					items: [
						{
							href: toRoute(Routes.SETTINGS_DATA_SOURCE_LIST, {
								groupId,
							}),
							label: Liferay.Language.get('settings'),
							symbol: 'cog',
						},
						{
							label: Liferay.Language.get('switch-workspaces'),
							onClick: () => window.location.assign(Routes.BASE),
						},
						{
							label: Liferay.Language.get('sign-out'),
							onClick: () =>
								window.location.assign(Routes.LOGOUT),
						},
					],
					name: currentUser.name || currentUser.emailAddress,
				}}
			/>
		</Suspense>
	);
};

export default UnifiedNavigation;
