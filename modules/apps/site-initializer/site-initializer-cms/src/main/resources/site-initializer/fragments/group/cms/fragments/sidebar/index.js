/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/* eslint-disable no-undef */

const sidebarId = `${fragmentEntryLinkNamespace}sidebar`;
const sidebarOpenKey = `${fragmentEntryLinkNamespace}sidebarOpen`;

const sidebar = fragmentElement.querySelector('.sidebar-container');
const sidebarCloseButton = fragmentElement.querySelector(
	'.sidebar-close-button'
);
const sidebarContainer = fragmentElement.querySelector('.sidebar-layout');
const sidebarTrigger = fragmentElement.querySelector('.sidebar-toggle');

let sidebarOpen = true;

if (layoutMode === 'view') {
	mountUnifiedNavigation();
}
else {
	initSidebar();
}

function initSidebar() {
	if (sidebarTrigger) {
		sidebar.setAttribute('id', sidebarId);
		sidebarTrigger.setAttribute('aria-controls', sidebarId);

		addSidebarToggleClickEventListener(sidebarTrigger);
	}

	if (sidebarCloseButton) {
		addSidebarToggleClickEventListener(sidebarCloseButton);
	}

	const sidebarOpenString = Liferay.Util.LocalStorage.getItem(
		sidebarOpenKey,
		Liferay.Util.LocalStorage.TYPES.FUNCTIONAL
	);

	sidebarOpen = sidebarOpenString === 'false' ? false : true;

	if (!sidebarOpen) {
		toggleSidebar(false);
	}
}

/**
 * Hands the shell over to the shared navigation component. The primary menu
 * becomes the component's sections, and everything else the page puts in the
 * sidebar and the top bar (Spaces, secondary menu, Global Menu, AI assistant,
 * personal bar) is passed as slot elements, so each product keeps its content.
 */
function mountUnifiedNavigation() {
	const navigationId = 'site';

	const sidebarBody = fragmentElement.querySelector('.sidebar-body');
	const topBar = fragmentElement.querySelector('.top-bar');

	const propsElement = sidebarBody.querySelector(
		'.vertical-navigation-props'
	);

	const navigationProps = propsElement
		? JSON.parse(propsElement.innerHTML)
		: {navItems: []};

	const primaryNavigationElement = propsElement?.closest(
		'[class*="lfr-layout-structure-item-"]'
	);

	const bodyElements = primaryNavigationElement
		? Array.from(primaryNavigationElement.parentElement.children).filter(
				(element) => element !== primaryNavigationElement
			)
		: [];

	const topBarItems = Array.from(topBar.querySelectorAll('.tbar-item'));

	const titleIndex = topBarItems.findIndex((item) =>
		item.classList.contains('tbar-item-expand')
	);

	const actionElements = topBarItems
		.slice(titleIndex + 1, -1)
		.filter((item) => item.children.length)
		.map(toSlotElement);

	const roots = fragmentElement.querySelector('.unified-navigation-roots');

	// The footer uses the same personal menu as DXP when the server could
	// build its items URL; otherwise the page's own personal bar moves in.

	const userMenu = roots.dataset.userMenuItemsUrl
		? {
				itemsURL: roots.dataset.userMenuItemsUrl,
				name: roots.dataset.userName,
				portraitURL: roots.dataset.userPortraitUrl || undefined,
			}
		: undefined;

	const userMenuElement = userMenu
		? undefined
		: toSlotElement(topBarItems.at(-1));

	const productTitle = topBarItems[titleIndex].textContent.trim();

	// The product logo sits right before the title, as an image (CMS, DSR) or
	// as an icon from the sprite (AI Hub). The items further left hold the
	// product's own sidebar trigger, which has icons too.

	const logoItems = topBarItems.slice(0, titleIndex).reverse();

	const logoImage = logoItems
		.map((item) => item.querySelector('img'))
		.find(Boolean);

	const logoIcon = logoImage
		? undefined
		: logoItems.map((item) => item.querySelector('svg use')).find(Boolean);

	// Guests get the top bar only, as there is nothing to navigate to.

	const signedIn = Liferay.ThemeDisplay.isSignedIn();

	const logo = {
		icon: logoIcon?.getAttribute('xlink:href')?.split('#')[1],
		iconColor: logoIcon
			? getComputedStyle(logoIcon.closest('svg')).color
			: undefined,
		imageURL: logoImage?.src,
	};

	fragmentElement.classList.add('unified-navigation-host');

	import('@liferay/product-navigation-unified-web/render').then(
		({renderUnifiedSidebar, renderUnifiedTopBar}) => {
			renderUnifiedTopBar(
				fragmentElement.querySelector('.unified-navigation-top-bar-root'),
				{
					actions: signedIn
						? actionElements
						: [...actionElements, toSlotElement(topBarItems.at(-1))],
					...(signedIn ? {} : logo),
					navigationId,
					sidebar: signedIn,

					// Guests have no sidebar, so the top bar keeps the product's
					// name and logo, as the original shell does.

					title: signedIn ? roots.dataset.pageTitle : productTitle,
				}
			);

			if (!signedIn) {
				return;
			}

			renderUnifiedSidebar(
				fragmentElement.querySelector('.unified-navigation-sidebar-root'),
				{
					active: navigationProps.active,
					ariaLabel: sidebar.getAttribute('aria-label'),
					bodySlots: bodyElements,
					colorSchemeToggle: Boolean(
						Liferay.FeatureFlags?.['LPD-57922']
					),
					...logo,
					navigationId,
					persistence: {
						key: `unified-navigation-pinned-${productTitle}`,
						type: 'local',
					},
					searchable: true,
					sections: [
						{
							id: 'primary',
							items: toNavigationItems(navigationProps.navItems),
						},
					],
					title: productTitle,
					userMenu,
					userMenuSlot: userMenuElement,
				}
			);
		}
	);
}

/**
 * Wraps the item's content without taking it out of the document. On SPA
 * navigations this code can run before the portlets and components inside
 * have mounted, and they look up their containers by ID, so a detached
 * container would never mount. The slot moves the wrapper later.
 */
function toSlotElement(item) {
	const element = document.createElement('div');

	element.append(...item.childNodes);

	item.append(element);

	return element;
}

function toNavigationItems(navItems) {
	return navItems.map((navItem) => ({
		href: navItem.href,
		icon: navItem.icon,
		id: String(navItem.id),
		items: navItem.items?.length
			? toNavigationItems(navItem.items)
			: undefined,
		label: navItem.label,
	}));
}

function addSidebarToggleClickEventListener(node) {
	node.addEventListener('click', () => handleSidebarToggleClick());

	node.removeAttribute('disabled');
}

function handleSidebarToggleClick() {
	sidebarOpen = !sidebarOpen;

	toggleSidebar();

	Liferay.Util.LocalStorage.setItem(
		sidebarOpenKey,
		sidebarOpen,
		Liferay.Util.LocalStorage.TYPES.FUNCTIONAL
	);
}

function toggleSidebar(moveFocus = true) {
	sidebarContainer.classList.toggle('open');

	sidebar.toggleAttribute('inert');

	if (sidebarTrigger) {
		sidebarTrigger
			.querySelectorAll('.inline-item')
			.forEach((node) => node.classList.toggle('hide'));

		sidebarTrigger.toggleAttribute('aria-expanded');
		sidebarTrigger.toggleAttribute('aria-pressed');

		if (sidebarOpen) {
			sidebarTrigger.setAttribute(
				'title',
				sidebarTrigger.dataset.titleclose
			);
		}
		else {
			sidebarTrigger.setAttribute(
				'title',
				sidebarTrigger.dataset.titleopen
			);
		}
	}

	if (moveFocus) {
		if (sidebarTrigger) {
			sidebarTrigger.focus();
		}
	}
}
