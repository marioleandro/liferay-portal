<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
SideNavigationDisplayContext sideNavigationDisplayContext = (SideNavigationDisplayContext)request.getAttribute(SideNavigationDisplayContext.class.getName());
%>

<div class="cadmin d-print-none lfr-product-menu-panel side-navigation-container side-navigation-fixed" id="com_liferay_application_list_taglib_side_navigation_container">
	<c:if test="<%= sideNavigationDisplayContext.isVisible() %>">
		<div class="c-slideout c-slideout-fixed c-slideout-push c-slideout-shown c-slideout-start">
			<section class="c-slideout-show sidebar sidebar-light skeleton" data-qa-id="sideNavigation" data-testid="sideNavigation">
				<svg class="side-navigation-skeleton">
					<use href="<%= String.format("%s/skeletons/homes_side_navigation.svg#homes-side-navigation", themeDisplay.getPathThemeImages()) %>" />
				</svg>
			</section>
		</div>
	</c:if>

	<react:component
		module="{SideNavigation} from application-list-taglib"
		props="<%= sideNavigationDisplayContext.getProps() %>"
	/>
</div>