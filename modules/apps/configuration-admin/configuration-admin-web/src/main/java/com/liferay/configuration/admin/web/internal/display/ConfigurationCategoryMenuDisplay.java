/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.configuration.admin.web.internal.display;

import com.liferay.configuration.admin.util.ConfigurationPidUtil;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.VerticalNavItemList;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.configuration.metatype.annotations.ExtendedObjectClassDefinition;
import com.liferay.portal.kernel.language.LanguageUtil;

import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Jorge Ferrer
 */
public class ConfigurationCategoryMenuDisplay {

	public ConfigurationCategoryMenuDisplay(
		ConfigurationCategoryDisplay configurationCategoryDisplay,
		Set<ConfigurationEntry> configurationEntries,
		ExtendedObjectClassDefinition.Scope scope) {

		_configurationCategoryDisplay = configurationCategoryDisplay;

		_configurationScopeDisplay = new ConfigurationScopeDisplay(
			scope.toString());

		for (ConfigurationEntry configurationEntry : configurationEntries) {
			_configurationScopeDisplay.add(configurationEntry);
		}
	}

	public ConfigurationCategoryDisplay getConfigurationCategoryDisplay() {
		return _configurationCategoryDisplay;
	}

	public Collection<ConfigurationScopeDisplay>
		getConfigurationScopeDisplays() {

		return Collections.singletonList(_configurationScopeDisplay);
	}

	public ConfigurationEntry getFirstConfigurationEntry() {
		List<ConfigurationEntry> configurationEntries =
			_configurationScopeDisplay.getConfigurationEntries();

		if (!configurationEntries.isEmpty()) {
			return configurationEntries.get(0);
		}

		return null;
	}

	public VerticalNavItemList getVerticalNavItemList(
		ConfigurationEntry configurationEntry,
		ConfigurationScopeDisplay configurationScopeDisplay,
		RenderRequest renderRequest, RenderResponse renderResponse) {

		VerticalNavItemList verticalNavItemList = new VerticalNavItemList();

		List<ConfigurationEntry> configurationEntries =
			configurationScopeDisplay.getConfigurationEntries();

		Set<String> duplicateNames = new HashSet<>();
		Set<String> names = new HashSet<>();

		for (ConfigurationEntry currentConfigurationEntry :
				configurationEntries) {

			String name = currentConfigurationEntry.getName(
				renderRequest.getLocale());

			if (names.add(name)) {
				continue;
			}

			duplicateNames.add(name);
		}

		for (ConfigurationEntry currentConfigurationEntry :
				configurationEntries) {

			verticalNavItemList.add(
				verticalNavItem -> {
					verticalNavItem.put(
						"deprecated", currentConfigurationEntry.isDeprecated());

					String key = ConfigurationPidUtil.getRawPid(
						configurationEntry.getKey());

					verticalNavItem.setActive(
						key.equals(
							ConfigurationPidUtil.getRawPid(
								currentConfigurationEntry.getKey())));

					verticalNavItem.setHref(
						currentConfigurationEntry.getEditURL(
							renderRequest, renderResponse));
					verticalNavItem.setId(currentConfigurationEntry.getKey());

					String name = currentConfigurationEntry.getName(
						renderRequest.getLocale());

					if (duplicateNames.contains(name)) {
						verticalNavItem.setLabel(
							StringBundler.concat(
								name, " (",
								LanguageUtil.get(
									renderRequest.getLocale(),
									"scope." +
										currentConfigurationEntry.getScope()),
								")"));
					}
					else {
						verticalNavItem.setLabel(name);
					}
				});
		}

		return verticalNavItemList;
	}

	public boolean isEmpty() {
		return _configurationScopeDisplay.isEmpty();
	}

	private final ConfigurationCategoryDisplay _configurationCategoryDisplay;
	private final ConfigurationScopeDisplay _configurationScopeDisplay;

}