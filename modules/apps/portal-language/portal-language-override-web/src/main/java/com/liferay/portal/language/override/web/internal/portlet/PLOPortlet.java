/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet;

import com.liferay.portal.kernel.portlet.bridges.mvc.MVCPortlet;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.language.override.constants.PLOPortletKeys;
import com.liferay.portal.language.override.web.internal.display.context.ViewDisplayContextFactory;

import jakarta.portlet.Portlet;
import jakarta.portlet.PortletException;
import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import java.io.IOException;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Drew Brokke
 */
@Component(
	property = {
		"com.liferay.portlet.display-category=category.hidden",
		"com.liferay.portlet.preferences-owned-by-group=true",
		"com.liferay.portlet.private-request-attributes=false",
		"com.liferay.portlet.private-session-attributes=false",
		"com.liferay.portlet.single-page-application=false",
		"com.liferay.portlet.use-default-template=true",
		"jakarta.portlet.display-name=Portal Language Override",
		"jakarta.portlet.expiration-cache=0",
		"jakarta.portlet.init-param.template-path=/META-INF/resources/",
		"jakarta.portlet.init-param.view-template=/view.jsp",
		"jakarta.portlet.name=" + PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE,
		"jakarta.portlet.resource-bundle=content.Language",
		"jakarta.portlet.security-role-ref=administrator",
		"jakarta.portlet.version=4.0"
	},
	service = Portlet.class
)
public class PLOPortlet extends MVCPortlet {

	@Override
	protected void doDispatch(
			RenderRequest renderRequest, RenderResponse renderResponse)
		throws IOException, PortletException {

		String path = getPath(renderRequest, renderResponse);

		if ((path == null) || path.equals("/view.jsp")) {
			renderRequest.setAttribute(
				WebKeys.PORTLET_DISPLAY_CONTEXT,
				_viewDisplayContextFactory.create(
					renderRequest, renderResponse));
		}

		super.doDispatch(renderRequest, renderResponse);
	}

	@Reference
	private ViewDisplayContextFactory _viewDisplayContextFactory;

}