/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.configuration.admin.web.internal.display;

import com.liferay.frontend.taglib.clay.servlet.taglib.util.VerticalNavItem;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.VerticalNavItemList;
import com.liferay.portal.configuration.metatype.annotations.ExtendedObjectClassDefinition;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.SetUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.portlet.RenderRequest;
import jakarta.portlet.RenderResponse;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Mario Leandro
 */
public class ConfigurationCategoryMenuDisplayTest extends Mockito {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testGetConfigurationEntries() {
		_testGetConfigurationEntries(
			ExtendedObjectClassDefinition.Scope.COMPANY);
		_testGetConfigurationEntries(ExtendedObjectClassDefinition.Scope.GROUP);
		_testGetConfigurationEntries(
			ExtendedObjectClassDefinition.Scope.SYSTEM);
	}

	@Test
	public void testGetVerticalNavItemList() {
		LanguageUtil languageUtil = new LanguageUtil();

		Language language = mock(Language.class);

		when(
			language.get(Mockito.any(Locale.class), Mockito.anyString())
		).thenAnswer(
			invocationOnMock -> invocationOnMock.getArgument(1)
		);

		languageUtil.setLanguage(language);

		String duplicateName = RandomTestUtil.randomString();

		ConfigurationEntry companyConfigurationEntry = _mockConfigurationEntry(
			duplicateName,
			ExtendedObjectClassDefinition.Scope.COMPANY.toString());
		ConfigurationEntry systemConfigurationEntry = _mockConfigurationEntry(
			duplicateName,
			ExtendedObjectClassDefinition.Scope.SYSTEM.toString());

		String uniqueName = RandomTestUtil.randomString();

		ConfigurationEntry uniqueConfigurationEntry = _mockConfigurationEntry(
			uniqueName, ExtendedObjectClassDefinition.Scope.SYSTEM.toString());

		ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay =
			new ConfigurationCategoryMenuDisplay(
				mock(ConfigurationCategoryDisplay.class),
				SetUtil.fromArray(
					companyConfigurationEntry, systemConfigurationEntry,
					uniqueConfigurationEntry),
				ExtendedObjectClassDefinition.Scope.SYSTEM);

		Collection<ConfigurationScopeDisplay> configurationScopeDisplays =
			configurationCategoryMenuDisplay.getConfigurationScopeDisplays();

		Iterator<ConfigurationScopeDisplay> iterator =
			configurationScopeDisplays.iterator();

		RenderRequest renderRequest = mock(RenderRequest.class);

		when(
			renderRequest.getLocale()
		).thenReturn(
			LocaleUtil.US
		);

		VerticalNavItemList verticalNavItemList =
			configurationCategoryMenuDisplay.getVerticalNavItemList(
				companyConfigurationEntry, iterator.next(), renderRequest,
				mock(RenderResponse.class));

		Map<Object, Object> labels = new HashMap<>();

		for (VerticalNavItem verticalNavItem : verticalNavItemList) {
			labels.put(verticalNavItem.get("id"), verticalNavItem.get("label"));
		}

		Assert.assertEquals(labels.toString(), 3, labels.size());
		Assert.assertEquals(
			duplicateName + " (instance)",
			labels.get(companyConfigurationEntry.getKey()));
		Assert.assertEquals(
			duplicateName + " (system)",
			labels.get(systemConfigurationEntry.getKey()));
		Assert.assertEquals(
			uniqueName, labels.get(uniqueConfigurationEntry.getKey()));
	}

	private ConfigurationEntry _mockConfigurationEntry(String scope) {
		return _mockConfigurationEntry(RandomTestUtil.randomString(), scope);
	}

	private ConfigurationEntry _mockConfigurationEntry(
		String name, String scope) {

		ConfigurationEntry configurationEntry = mock(ConfigurationEntry.class);

		when(
			configurationEntry.getKey()
		).thenReturn(
			RandomTestUtil.randomString()
		);

		when(
			configurationEntry.getName(Mockito.any(Locale.class))
		).thenReturn(
			name
		);

		when(
			configurationEntry.getScope()
		).thenReturn(
			scope
		);

		return configurationEntry;
	}

	private void _testGetConfigurationEntries(
		ExtendedObjectClassDefinition.Scope scope) {

		ConfigurationEntry groupConfigurationEntry = _mockConfigurationEntry(
			ExtendedObjectClassDefinition.Scope.GROUP.toString());
		ConfigurationEntry systemConfigurationEntry = _mockConfigurationEntry(
			ExtendedObjectClassDefinition.Scope.SYSTEM.toString());

		ConfigurationCategoryMenuDisplay configurationCategoryMenuDisplay =
			new ConfigurationCategoryMenuDisplay(
				mock(ConfigurationCategoryDisplay.class),
				SetUtil.fromArray(
					groupConfigurationEntry, systemConfigurationEntry),
				scope);

		Collection<ConfigurationScopeDisplay> configurationScopeDisplays =
			configurationCategoryMenuDisplay.getConfigurationScopeDisplays();

		Assert.assertEquals(
			configurationScopeDisplays.toString(), 1,
			configurationScopeDisplays.size());

		Iterator<ConfigurationScopeDisplay> iterator =
			configurationScopeDisplays.iterator();

		ConfigurationScopeDisplay configurationScopeDisplay = iterator.next();

		Assert.assertEquals(
			scope.toString(), configurationScopeDisplay.getScope());

		List<ConfigurationEntry> configurationEntries =
			configurationScopeDisplay.getConfigurationEntries();

		Assert.assertEquals(
			configurationEntries.toString(), 2, configurationEntries.size());
		Assert.assertTrue(
			configurationEntries.contains(groupConfigurationEntry));
		Assert.assertTrue(
			configurationEntries.contains(systemConfigurationEntry));
	}

}