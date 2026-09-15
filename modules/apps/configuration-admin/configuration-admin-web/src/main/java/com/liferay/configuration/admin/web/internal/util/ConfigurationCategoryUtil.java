/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.configuration.admin.web.internal.util;

import com.liferay.configuration.admin.category.ConfigurationCategoryNavigationItemContributor;
import com.liferay.configuration.admin.web.internal.display.ConfigurationCategoryMenuDisplay;
import com.liferay.configuration.admin.web.internal.display.ConfigurationEntry;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.NavigationItemList;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.Validator;

import jakarta.portlet.PortletURL;
import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * @author Drew Brokke
 */
public class ConfigurationCategoryUtil {

	public static String getDefaultHREF(
		ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay,
		List<ConfigurationCategoryNavigationItemContributor>
			configurationCategoryNavigationItemContributors,
		LiferayPortletResponse liferayPortletResponse,
		RenderRequest renderRequest, RenderResponse renderResponse) {

		if (ListUtil.isEmpty(configurationCategoryNavigationItemContributors)) {
			return getHREF(
				configurationCategoryMenuDisplay, liferayPortletResponse,
				renderRequest, renderResponse);
		}

		ConfigurationCategoryNavigationItemContributor
			configurationCategoryNavigationItemContributor =
				configurationCategoryNavigationItemContributors.get(0);

		return _getHREF(
			configurationCategoryNavigationItemContributor.getKey(),
			liferayPortletResponse);
	}

	public static String getHREF(
		ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay,
		LiferayPortletResponse liferayPortletResponse,
		RenderRequest renderRequest, RenderResponse renderResponse) {

		if (!configurationCategoryMenuDisplay.isEmpty()) {
			ConfigurationEntry configurationEntry =
				configurationCategoryMenuDisplay.getFirstConfigurationEntry();

			return configurationEntry.getEditURL(renderRequest, renderResponse);
		}

		PortletURL portletURL = liferayPortletResponse.createRenderURL();

		return portletURL.toString();
	}

	public static NavigationItemList getNavigationItemList(
		ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay,
		List<ConfigurationCategoryNavigationItemContributor>
			configurationCategoryNavigationItemContributors,
		String configurationCategoryNavigationItemKey,
		LiferayPortletResponse liferayPortletResponse,
		RenderRequest renderRequest, RenderResponse renderResponse) {

		NavigationItemList navigationItemList = new NavigationItemList();

		Locale locale = renderRequest.getLocale();

		for (ConfigurationCategoryNavigationItemContributor
				configurationCategoryNavigationItemContributor :
					configurationCategoryNavigationItemContributors) {

			navigationItemList.add(
				navigationItem -> {
					String key =
						configurationCategoryNavigationItemContributor.getKey();

					navigationItem.setActive(
						Objects.equals(
							configurationCategoryNavigationItemKey, key));
					navigationItem.setHref(
						_getHREF(key, liferayPortletResponse));

					navigationItem.setLabel(
						configurationCategoryNavigationItemContributor.getName(
							locale));
				});
		}

		navigationItemList.add(
			navigationItem -> {
				navigationItem.setActive(
					Validator.isNull(configurationCategoryNavigationItemKey));
				navigationItem.setHref(
					getHREF(
						configurationCategoryMenuDisplay,
						liferayPortletResponse, renderRequest, renderResponse));
				navigationItem.setLabel(
					LanguageUtil.get(locale, "configuration"));
			});

		return navigationItemList;
	}

	private static String _getHREF(
		String configurationCategoryNavigationItemKey,
		LiferayPortletResponse liferayPortletResponse) {

		return PortletURLBuilder.createRenderURL(
			liferayPortletResponse
		).setMVCRenderCommandName(
			"/configuration_admin/view_configuration_screen"
		).setParameter(
			"configurationCategoryNavigationItemKey",
			configurationCategoryNavigationItemKey
		).buildString();
	}

}