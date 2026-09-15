/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.configuration.admin.web.internal.portlet.action;

import com.liferay.configuration.admin.category.ConfigurationCategory;
import com.liferay.configuration.admin.category.ConfigurationCategoryNavigationItemContributor;
import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.configuration.admin.display.ConfigurationScreen;
import com.liferay.configuration.admin.web.internal.constants.ConfigurationAdminWebKeys;
import com.liferay.configuration.admin.web.internal.display.ConfigurationEntry;
import com.liferay.configuration.admin.web.internal.display.ConfigurationScreenConfigurationEntry;
import com.liferay.configuration.admin.web.internal.display.context.ConfigurationScopeDisplayContext;
import com.liferay.configuration.admin.web.internal.display.context.ConfigurationScopeDisplayContextFactory;
import com.liferay.configuration.admin.web.internal.util.ConfigurationEntryRetriever;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.configuration.metatype.annotations.ExtendedObjectClassDefinition;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCRenderCommand;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;

import jakarta.portlet.PortletException;
import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Jorge Ferrer
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.SITE_SETTINGS,
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.SYSTEM_SETTINGS,
		"mvc.command.name=/configuration_admin/view_configuration_screen",
		"service.ranking:Integer=" + (Integer.MAX_VALUE - 1000)
	},
	service = MVCRenderCommand.class
)
public class ViewConfigurationScreenMVCRenderCommand
	implements MVCRenderCommand {

	@Override
	public String render(
			RenderRequest renderRequest, RenderResponse renderResponse)
		throws PortletException {

		String configurationCategoryNavigationItemKey = ParamUtil.getString(
			renderRequest, "configurationCategoryNavigationItemKey");

		ConfigurationScopeDisplayContext configurationScopeDisplayContext =
			ConfigurationScopeDisplayContextFactory.create(renderRequest);

		String configurationCategoryKey = null;

		if (Validator.isNull(configurationCategoryNavigationItemKey)) {
			configurationCategoryKey =
				_setConfigurationScreenAttributesAndGetCategoryKey(
					renderRequest);
		}
		else {
			configurationCategoryKey =
				_setConfigurationCategoryNavigationItemContributorAttributeAndGetCategoryKey(
					configurationCategoryNavigationItemKey, renderRequest,
					configurationScopeDisplayContext.getScope());
		}

		ThemeDisplay themeDisplay = (ThemeDisplay)renderRequest.getAttribute(
			WebKeys.THEME_DISPLAY);

		renderRequest.setAttribute(
			ConfigurationAdminWebKeys.CONFIGURATION_CATEGORY_MENU_DISPLAY,
			_configurationEntryRetriever.getConfigurationCategoryMenuDisplay(
				configurationCategoryKey, themeDisplay.getLanguageId(),
				configurationScopeDisplayContext.getScope(),
				configurationScopeDisplayContext.getScopePK()));

		renderRequest.setAttribute(
			ConfigurationAdminWebKeys.
				CONFIGURATION_CATEGORY_NAVIGATION_ITEM_CONTRIBUTORS,
			_configurationEntryRetriever.
				getConfigurationCategoryNavigationItemContributors(
					configurationCategoryKey,
					configurationScopeDisplayContext.getScope()));

		return "/view_configuration_screen.jsp";
	}

	private String
			_setConfigurationCategoryNavigationItemContributorAttributeAndGetCategoryKey(
				String configurationCategoryNavigationItemKey,
				RenderRequest renderRequest,
				ExtendedObjectClassDefinition.Scope scope)
		throws PortletException {

		ConfigurationCategoryNavigationItemContributor
			configurationCategoryNavigationItemContributor =
				_configurationEntryRetriever.
					getConfigurationCategoryNavigationItemContributor(
						configurationCategoryNavigationItemKey);

		if ((configurationCategoryNavigationItemContributor == null) ||
			!configurationCategoryNavigationItemContributor.isVisible() ||
			!scope.equals(
				configurationCategoryNavigationItemContributor.getScope())) {

			throw new PortletException(
				StringBundler.concat(
					"The configuration category navigation item \"",
					configurationCategoryNavigationItemKey,
					"\" is not accessible"));
		}

		String configurationCategoryKey =
			configurationCategoryNavigationItemContributor.getCategoryKey();

		ConfigurationCategory configurationCategory =
			_configurationEntryRetriever.getConfigurationCategory(
				configurationCategoryKey);

		if (configurationCategory == null) {
			throw new PortletException(
				StringBundler.concat(
					"The configuration category \"", configurationCategoryKey,
					"\" is not accessible"));
		}

		renderRequest.setAttribute(
			ConfigurationAdminWebKeys.
				CONFIGURATION_CATEGORY_NAVIGATION_ITEM_CONTRIBUTOR,
			configurationCategoryNavigationItemContributor);

		return configurationCategoryKey;
	}

	private String _setConfigurationScreenAttributesAndGetCategoryKey(
			RenderRequest renderRequest)
		throws PortletException {

		String configurationScreenKey = ParamUtil.getString(
			renderRequest, "configurationScreenKey");

		ConfigurationScreen configurationScreen =
			_configurationEntryRetriever.getConfigurationScreen(
				configurationScreenKey);

		if (!configurationScreen.isVisible()) {
			ThemeDisplay themeDisplay =
				(ThemeDisplay)renderRequest.getAttribute(WebKeys.THEME_DISPLAY);

			throw new PortletException(
				StringBundler.concat(
					"The ", configurationScreen.getScope(), " configuration \"",
					configurationScreen.getName(themeDisplay.getLocale()),
					"\" is not accessible"));
		}

		renderRequest.setAttribute(
			ConfigurationAdminWebKeys.CONFIGURATION_SCREEN,
			configurationScreen);

		ConfigurationEntry configurationEntry =
			new ConfigurationScreenConfigurationEntry(configurationScreen);

		renderRequest.setAttribute(
			ConfigurationAdminWebKeys.CONFIGURATION_ENTRY, configurationEntry);

		return configurationScreen.getCategoryKey();
	}

	@Reference
	private ConfigurationEntryRetriever _configurationEntryRetriever;

}