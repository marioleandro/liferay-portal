/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.configuration.admin.category;

import com.liferay.configuration.admin.category.ConfigurationCategoryNavigationItemContributor;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.language.override.web.internal.display.context.ViewDisplayContextFactory;
import com.liferay.portal.language.override.web.internal.servlet.PLOJSPIncluder;

import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Leandro
 */
@Component(service = ConfigurationCategoryNavigationItemContributor.class)
public class PLOConfigurationCategoryNavigationItemContributor
	implements ConfigurationCategoryNavigationItemContributor {

	public static final String KEY = "language-overrides";

	@Override
	public String getCategoryKey() {
		return "localization";
	}

	@Override
	public String getKey() {
		return KEY;
	}

	@Override
	public String getName(Locale locale) {
		return _language.get(locale, "language-overrides");
	}

	@Override
	public void render(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		httpServletRequest.setAttribute(
			WebKeys.PORTLET_DISPLAY_CONTEXT,
			_viewDisplayContextFactory.create(
				(RenderRequest)httpServletRequest.getAttribute(
					JavaConstants.JAKARTA_PORTLET_REQUEST),
				(RenderResponse)httpServletRequest.getAttribute(
					JavaConstants.JAKARTA_PORTLET_RESPONSE)));

		PLOJSPIncluder.include(
			_servletContext, "/view.jsp", httpServletRequest,
			httpServletResponse);
	}

	@Reference
	private Language _language;

	@Reference(
		target = "(osgi.web.symbolicname=com.liferay.portal.language.override.web)"
	)
	private ServletContext _servletContext;

	@Reference
	private ViewDisplayContextFactory _viewDisplayContextFactory;

}