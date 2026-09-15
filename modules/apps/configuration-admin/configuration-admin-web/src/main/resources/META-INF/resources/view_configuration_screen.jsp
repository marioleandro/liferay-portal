<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
String redirect = ParamUtil.getString(request, "redirect");

ConfigurationScreen configurationScreen = (ConfigurationScreen)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_SCREEN);

PortletURL portletURL = renderResponse.createRenderURL();

if (Validator.isNull(redirect)) {
	redirect = portletURL.toString();
}

PortalUtil.addPortletBreadcrumbEntry(request, portletDisplay.getPortletDisplayName(), String.valueOf(renderResponse.createRenderURL()));

ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay = (ConfigurationCategoryMenuDisplay)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_MENU_DISPLAY);

ConfigurationCategoryDisplay configurationCategoryDisplay = configurationCategoryMenuDisplay.getConfigurationCategoryDisplay();

String categoryDisplayName = configurationCategoryDisplay.getCategoryLabel(locale);

String viewCategoryHREF = ConfigurationCategoryUtil.getHREF(configurationCategoryMenuDisplay, liferayPortletResponse, renderRequest, renderResponse);

PortalUtil.addPortletBreadcrumbEntry(request, categoryDisplayName, viewCategoryHREF);

portletDisplay.setShowBackIcon(true);
portletDisplay.setURLBack(portletURL.toString());

renderResponse.setTitle(categoryDisplayName);

ConfigurationCategoryNavigationItemContributor configurationCategoryNavigationItemContributor = (ConfigurationCategoryNavigationItemContributor)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_NAVIGATION_ITEM_CONTRIBUTOR);

List<ConfigurationCategoryNavigationItemContributor> configurationCategoryNavigationItemContributors = (List<ConfigurationCategoryNavigationItemContributor>)request.getAttribute(ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_NAVIGATION_ITEM_CONTRIBUTORS);

String configurationCategoryNavigationItemKey = ParamUtil.getString(request, "configurationCategoryNavigationItemKey");

NavigationItemList navigationItemList = null;

if (ListUtil.isNotEmpty(configurationCategoryNavigationItemContributors)) {
	navigationItemList = ConfigurationCategoryUtil.getNavigationItemList(configurationCategoryMenuDisplay, configurationCategoryNavigationItemContributors, configurationCategoryNavigationItemKey, liferayPortletResponse, renderRequest, renderResponse);
}
%>

<clay:container-fluid>
	<clay:col
		size="12"
	>
		<c:choose>
			<c:when test="<%= navigationItemList != null %>">
				<clay:navigation-bar
					navigationItems="<%= navigationItemList %>"
				/>
			</c:when>
			<c:otherwise>
				<liferay-site-navigation:breadcrumb
					breadcrumbEntries="<%= BreadcrumbEntriesUtil.getBreadcrumbEntries(request, false, false, false, false, true) %>"
				/>
			</c:otherwise>
		</c:choose>
	</clay:col>
</clay:container-fluid>

<c:choose>
	<c:when test="<%= configurationCategoryNavigationItemContributor != null %>">

		<%
		configurationCategoryNavigationItemContributor.render(request, PipingServletResponseFactory.createPipingServletResponse(pageContext));
		%>

	</c:when>
	<c:otherwise>
		<clay:container-fluid>
			<clay:row>
				<clay:col
					md="3"
				>
					<liferay-util:include page="/configuration_category_menu.jsp" servletContext="<%= application %>" />
				</clay:col>

				<clay:col
					md="9"
				>

					<%
					configurationScreen.render(request, PipingServletResponseFactory.createPipingServletResponse(pageContext));
					%>

				</clay:col>
			</clay:row>
		</clay:container-fluid>
	</c:otherwise>
</c:choose>