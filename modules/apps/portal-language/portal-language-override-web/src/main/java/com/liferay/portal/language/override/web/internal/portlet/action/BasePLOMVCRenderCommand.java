/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.action;

import com.liferay.portal.kernel.portlet.bridges.mvc.MVCRenderCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.constants.MVCRenderConstants;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.language.override.web.internal.servlet.PLOJSPIncluder;

import jakarta.portlet.PortletException;
import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Leandro
 */
public abstract class BasePLOMVCRenderCommand implements MVCRenderCommand {

	@Override
	public String render(
			RenderRequest renderRequest, RenderResponse renderResponse)
		throws PortletException {

		HttpServletRequest httpServletRequest = portal.getHttpServletRequest(
			renderRequest);

		setAttributes(httpServletRequest, renderRequest);

		try {
			PLOJSPIncluder.include(
				servletContext, getJspPath(), httpServletRequest,
				portal.getHttpServletResponse(renderResponse));
		}
		catch (IOException ioException) {
			throw new PortletException(ioException);
		}

		return MVCRenderConstants.MVC_PATH_VALUE_SKIP_DISPATCH;
	}

	protected abstract String getJspPath();

	protected void setAttributes(
		HttpServletRequest httpServletRequest, RenderRequest renderRequest) {
	}

	@Reference
	protected Portal portal;

	@Reference(
		target = "(osgi.web.symbolicname=com.liferay.portal.language.override.web)"
	)
	protected ServletContext servletContext;

}