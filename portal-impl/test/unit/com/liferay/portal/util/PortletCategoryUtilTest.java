/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.util;

import com.liferay.portal.kernel.util.PortletCategoryKeys;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Mario Leandro
 */
public class PortletCategoryUtilTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testGetPortletCategoryKeyMapsConfigurationToInstance() {
		Assert.assertEquals(
			PortletCategoryKeys.CONTROL_PANEL_INSTANCE,
			PortletCategoryUtil.getPortletCategoryKey("configuration"));
		Assert.assertEquals(
			PortletCategoryKeys.CONTROL_PANEL_INSTANCE,
			PortletCategoryUtil.getPortletCategoryKey(
				"control_panel.configuration"));
		Assert.assertEquals(
			PortletCategoryKeys.CONTROL_PANEL_INSTANCE,
			PortletCategoryUtil.getPortletCategoryKey("portal"));
	}

	@Test
	public void testGetPortletCategoryKeyMapsServerToSystem() {
		Assert.assertEquals(
			PortletCategoryKeys.CONTROL_PANEL_SYSTEM,
			PortletCategoryUtil.getPortletCategoryKey("server"));
	}

}