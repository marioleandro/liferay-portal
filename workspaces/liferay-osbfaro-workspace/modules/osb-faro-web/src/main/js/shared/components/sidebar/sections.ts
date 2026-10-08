import {ACCOUNTS, Routes, SEGMENTS, toRoute} from 'shared/util/router';

export interface ISidebarNavItem {
	icon: string;
	id: string;
	label: string;
	route: string;
	url: string;
}

export interface ISidebarNavSection {
	id: string;
	items: ISidebarNavItem[];
	label: string;
}

interface ISidebarSectionsParams {
	channelId?: string;
	groupId: string;
	LDPEnabled: boolean;
}

/**
 * The menu both navigation layouts render: the product's own sidebar and the
 * shared unified navigation. Items marked LDP only are left out for Analytics
 * Cloud workspaces.
 */
export default function getSidebarSections({
	channelId,
	groupId,
	LDPEnabled,
}: ISidebarSectionsParams): ISidebarNavSection[] {
	return [
		{
			id: 'touchpoints',
			items: [
				LDPEnabled && {
					icon: 'plant',
					id: 'lifecycles',
					label: Liferay.Language.get('lifecycles'),
					route: Routes.LIFECYCLE,
					url: toRoute(Routes.LIFECYCLE, {channelId, groupId}),
				},
				LDPEnabled && {
					icon: 'megaphone',
					id: 'campaigns',
					label: Liferay.Language.get('campaigns'),
					route: Routes.CAMPAIGNS,
					url: toRoute(Routes.CAMPAIGNS, {channelId, groupId}),
				},
				{
					icon: 'sites',
					id: 'sites',
					label: Liferay.Language.get('sites'),
					route: Routes.SITES,
					url: toRoute(Routes.SITES, {channelId, groupId}),
				},
				{
					icon: 'sheets',
					id: 'assets',
					label: Liferay.Language.get('assets'),
					route: Routes.ASSETS,
					url: toRoute(Routes.ASSETS, {
						channelId,
						groupId,
					}),
				},
				{
					icon: 'click',
					id: 'events',
					label: Liferay.Language.get('events'),
					route: Routes.EVENT_ANALYSIS,
					url: toRoute(Routes.EVENT_ANALYSIS, {
						channelId,
						groupId,
					}),
				},
			].filter(Boolean) as ISidebarNavItem[],
			label: Liferay.Language.get('touchpoints'),
		},
		{
			id: 'people',
			items: [
				{
					icon: 'box-squared',
					id: 'segments',
					label: Liferay.Language.get('segments'),
					route: `${Routes.CONTACTS}/${SEGMENTS}`,
					url: toRoute(Routes.CONTACTS_LIST_ENTITY, {
						channelId,
						groupId,
						type: SEGMENTS,
					}),
				},
				LDPEnabled && {
					icon: 'briefcase',
					id: 'accounts',
					label: Liferay.Language.get('accounts'),
					route: `${Routes.CONTACTS}/${ACCOUNTS}`,
					url: toRoute(Routes.CONTACTS_LIST_ENTITY, {
						channelId,
						groupId,
						type: ACCOUNTS,
					}),
				},
				{
					icon: 'users',
					id: 'individuals',
					label: Liferay.Language.get('individuals'),
					route: Routes.CONTACTS_INDIVIDUALS,
					url: toRoute(Routes.CONTACTS_INDIVIDUALS, {
						channelId,
						groupId,
					}),
				},
			].filter(Boolean) as ISidebarNavItem[],
			label: Liferay.Language.get('people'),
		},
		{
			id: 'optimize',
			items: [
				{
					icon: 'test',
					id: 'tests',
					label: Liferay.Language.get('tests'),
					route: Routes.TESTS,
					url: toRoute(Routes.TESTS, {channelId, groupId}),
				},
			],
			label: Liferay.Language.get('optimize'),
		},
	];
}
