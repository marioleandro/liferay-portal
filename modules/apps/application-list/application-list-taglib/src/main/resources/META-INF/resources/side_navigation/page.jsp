<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/side_navigation/init.jsp" %>

<%
SideNavigationDisplayContext sideNavigationDisplayContext = new SideNavigationDisplayContext(request);
%>

<div class="side-navigation-container" id="com_liferay_application_list_taglib_side_navigation_container" style="--side-navigation-initial-start: <%= sideNavigationDisplayContext.isVisible() ? "280px" : "0px" %>;">
	<react:component
		module="{SideNavigation} from application-list-taglib"
		props="<%= sideNavigationDisplayContext.getProps() %>"
	/>
</div>