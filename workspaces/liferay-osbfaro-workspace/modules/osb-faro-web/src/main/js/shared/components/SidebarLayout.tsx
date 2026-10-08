import Loading from 'shared/components/Loading';
import NoPropertiesAvailable from 'shared/pages/NoPropertiesAvailable';
import React, {Suspense, useRef} from 'react';
import Sidebar from 'shared/components/sidebar';
import Toolbar from 'shared/components/toolbar';
import UnifiedNavigation from 'shared/components/unified-navigation';
import {collapseSidebar} from 'shared/actions/sidebar';
import {Map} from 'immutable';
import {Outlet, useLocation, useParams} from 'react-router-dom';
import {RootState} from 'shared/store';
import {useChannelContext} from 'shared/context/channel';
import {useCurrentUser} from 'shared/hooks/useCurrentUser';
import {useDispatch, useSelector} from 'react-redux';

const NAVIGATION_STORAGE_KEY = 'ldp-navigation';

/**
 * Picks the original or the unified navigation, so both can be compared on the
 * same instance. `?navigation=original` or `?navigation=unified` switches it
 * and the choice is kept for the following pages.
 */
const useUnifiedNavigation = (search: string): boolean => {
	const navigation = new URLSearchParams(search).get('navigation');

	try {
		if (navigation === 'original' || navigation === 'unified') {
			localStorage.setItem(NAVIGATION_STORAGE_KEY, navigation);

			return navigation === 'unified';
		}

		return localStorage.getItem(NAVIGATION_STORAGE_KEY) !== 'original';
	} catch (error) {
		return navigation !== 'original';
	}
};

const SidebarLayout: React.FC = () => {
	const {groupId = ''} = useParams<{groupId: string}>();

	const {pathname, search} = useLocation();

	const {channels, selectedChannel} = useChannelContext();

	const currentUser = useCurrentUser();

	const unifiedNavigation = useUnifiedNavigation(search);

	const collapsed = useSelector((state: RootState) =>
		state.getIn(['sidebar', String(currentUser.id), 'collapsed'], false)
	);

	const collapsedSections = useSelector((state: RootState) =>
		state.getIn(
			['sidebar', String(currentUser.id), 'collapsedSections'],
			Map()
		)
	);

	const dispatch = useDispatch();

	const contentRef = useRef<HTMLDivElement>(null);

	const content = (
		<Suspense fallback={<Loading />}>
			{selectedChannel ? (
				<Outlet />
			) : (
				<NoPropertiesAvailable
					currentUser={currentUser}
					groupId={groupId}
				/>
			)}
		</Suspense>
	);

	if (unifiedNavigation) {
		return (
			<>
				<UnifiedNavigation
					activePathname={pathname}
					channelId={selectedChannel?.id}
					channels={channels}
					groupId={groupId}
				/>

				<div
					className="unified-navigation-content"
					style={{
						paddingLeft: 'var(--unified-navigation-start, 0px)',
						transition: 'padding 140ms ease-out',
					}}
				>
					{content}
				</div>
			</>
		);
	}

	return (
		<>
			<Toolbar groupId={groupId} />

			<div>
				<Sidebar
					activePathname={pathname}
					channelId={selectedChannel?.id}
					channels={channels}
					collapsed={collapsed}
					collapsedSections={collapsedSections}
					containerRef={contentRef}
					groupId={groupId}
					onCollapsedChange={(collapsed) =>
						dispatch(
							collapseSidebar({
								collapsed,
								currentUserId: currentUser.id,
							})
						)
					}
					onSectionToggle={(sectionKey, collapsed) =>
						dispatch(
							collapseSidebar({
								collapsed,
								currentUserId: currentUser.id,
								sectionKey,
							})
						)
					}
				/>

				<div ref={contentRef}>{content}</div>
			</div>
		</>
	);
};

export default SidebarLayout;
