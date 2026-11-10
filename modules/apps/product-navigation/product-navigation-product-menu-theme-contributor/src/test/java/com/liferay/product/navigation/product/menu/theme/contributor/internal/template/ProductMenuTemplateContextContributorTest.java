/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.product.navigation.product.menu.theme.contributor.internal.template;

import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.SessionClicks;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.LiferayUnitTestRule;
import com.liferay.product.navigation.product.menu.helper.ProductNavigationProductMenuHelper;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Mario Leandro
 */
public class ProductMenuTemplateContextContributorTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		_featureFlagManagerUtilMockedStatic = Mockito.mockStatic(
			FeatureFlagManagerUtil.class);

		_sessionClicksMockedStatic = Mockito.mockStatic(SessionClicks.class);

		_sessionClicksMockedStatic.when(
			() -> SessionClicks.get(
				Mockito.any(HttpServletRequest.class), Mockito.anyString(),
				Mockito.anyString())
		).thenAnswer(
			invocation -> invocation.getArgument(2)
		);

		ProductNavigationProductMenuHelper productNavigationProductMenuHelper =
			Mockito.mock(ProductNavigationProductMenuHelper.class);

		Mockito.when(
			productNavigationProductMenuHelper.isShowProductMenu(
				_httpServletRequest)
		).thenReturn(
			true
		);

		ReflectionTestUtil.setFieldValue(
			_productMenuTemplateContextContributor,
			"_productNavigationProductMenuHelper",
			productNavigationProductMenuHelper);

		ThemeDisplay themeDisplay = Mockito.mock(ThemeDisplay.class);

		Mockito.when(
			themeDisplay.isShowControlMenu()
		).thenReturn(
			true
		);

		Mockito.when(
			_httpServletRequest.getAttribute(WebKeys.THEME_DISPLAY)
		).thenReturn(
			themeDisplay
		);
	}

	@After
	public void tearDown() {
		_featureFlagManagerUtilMockedStatic.close();
		_sessionClicksMockedStatic.close();
	}

	@Test
	public void testPrepare() {
		_setUpFeatureFlag(false);

		Map<String, Object> contextObjects = _prepare();

		Assert.assertEquals("", contextObjects.get("bodyCssClass"));
		Assert.assertEquals(
			"closed", contextObjects.get("liferay_product_menu_state"));
	}

	@Test
	public void testPrepareWithTheFeatureFlagEnabled() {
		_setUpFeatureFlag(true);

		Map<String, Object> contextObjects = _prepare();

		Assert.assertEquals(
			" product-menu-unified-sidebar open product-menu-open",
			contextObjects.get("bodyCssClass"));
		Assert.assertEquals(
			"open", contextObjects.get("liferay_product_menu_state"));
	}

	private Map<String, Object> _prepare() {
		Map<String, Object> contextObjects = new HashMap<>();

		_productMenuTemplateContextContributor.prepare(
			contextObjects, _httpServletRequest);

		return contextObjects;
	}

	private void _setUpFeatureFlag(boolean enabled) {
		_featureFlagManagerUtilMockedStatic.when(
			() -> FeatureFlagManagerUtil.isEnabled(
				Mockito.anyLong(), Mockito.eq("LPD-88120"))
		).thenReturn(
			enabled
		);
	}

	private MockedStatic<FeatureFlagManagerUtil>
		_featureFlagManagerUtilMockedStatic;
	private final HttpServletRequest _httpServletRequest = Mockito.mock(
		HttpServletRequest.class);
	private final ProductMenuTemplateContextContributor
		_productMenuTemplateContextContributor =
			new ProductMenuTemplateContextContributor();
	private MockedStatic<SessionClicks> _sessionClicksMockedStatic;

}