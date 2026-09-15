/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.configuration.icon.util;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.language.override.constants.PLOPortletKeys;
import com.liferay.portal.language.override.web.internal.configuration.admin.category.PLOConfigurationCategoryNavigationItemContributor;

import jakarta.portlet.PortletRequest;

import java.util.Objects;

/**
 * @author Mario Leandro
 */
public class PLOPortletConfigurationIconUtil {

	public static boolean isLanguageOverridesView(
		Portal portal, PortletRequest portletRequest) {

		String portletId = portal.getPortletId(portletRequest);

		if (Objects.equals(
				portletId, PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE)) {

			return true;
		}

		if (!Objects.equals(
				portletId, ConfigurationAdminPortletKeys.INSTANCE_SETTINGS)) {

			return false;
		}

		return Objects.equals(
			ParamUtil.getString(
				portletRequest, "configurationCategoryNavigationItemKey"),
			PLOConfigurationCategoryNavigationItemContributor.KEY);
	}

}