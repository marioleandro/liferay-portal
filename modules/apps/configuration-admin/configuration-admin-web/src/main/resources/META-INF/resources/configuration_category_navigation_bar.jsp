<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay = (ConfigurationCategoryMenuDisplay)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_MENU_DISPLAY);

List<ConfigurationCategoryNavigationItemContributor> configurationCategoryNavigationItemContributors = (List<ConfigurationCategoryNavigationItemContributor>)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_NAVIGATION_ITEM_CONTRIBUTORS);

NavigationItemList navigationItemList = null;

if (ListUtil.isNotEmpty(configurationCategoryNavigationItemContributors)) {
	navigationItemList = ConfigurationCategoryUtil.getNavigationItemList(configurationCategoryMenuDisplay, configurationCategoryNavigationItemContributors, ParamUtil.getString(request, "configurationCategoryNavigationItemKey"), liferayPortletResponse, renderRequest, renderResponse);
}
%>

<c:choose>
	<c:when test="<%= navigationItemList != null %>">
		<clay:navigation-bar
			navigationItems="<%= navigationItemList %>"
		/>
	</c:when>
	<c:otherwise>
		<clay:container-fluid>
			<clay:col
				size="12"
			>
				<liferay-site-navigation:breadcrumb
					breadcrumbEntries="<%= BreadcrumbEntriesUtil.getBreadcrumbEntries(request, false, false, false, false, true) %>"
				/>
			</clay:col>
		</clay:container-fluid>
	</c:otherwise>
</c:choose>