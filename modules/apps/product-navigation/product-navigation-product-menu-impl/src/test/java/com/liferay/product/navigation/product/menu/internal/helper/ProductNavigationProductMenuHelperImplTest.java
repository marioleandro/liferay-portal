/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.product.navigation.product.menu.internal.helper;

import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Mario Leandro
 */
public class ProductNavigationProductMenuHelperImplTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testIsShowProductMenu() {
		HttpServletRequest httpServletRequest = Mockito.mock(
			HttpServletRequest.class);

		Mockito.when(
			httpServletRequest.getAttribute(WebKeys.THEME_DISPLAY)
		).thenReturn(
			new ThemeDisplay()
		);

		Assert.assertFalse(
			_productNavigationProductMenuHelperImpl.isShowProductMenu(
				httpServletRequest));

		Mockito.verify(
			httpServletRequest
		).setAttribute(
			_SHOW_PRODUCT_MENU, Boolean.FALSE
		);
	}

	@Test
	public void testIsShowProductMenuReturnsTheCachedValue() {
		HttpServletRequest httpServletRequest = Mockito.mock(
			HttpServletRequest.class);

		Mockito.when(
			httpServletRequest.getAttribute(_SHOW_PRODUCT_MENU)
		).thenReturn(
			true
		);

		Assert.assertTrue(
			_productNavigationProductMenuHelperImpl.isShowProductMenu(
				httpServletRequest));

		Mockito.verify(
			httpServletRequest, Mockito.never()
		).getAttribute(
			WebKeys.THEME_DISPLAY
		);
	}

	private static final String _SHOW_PRODUCT_MENU =
		ReflectionTestUtil.getFieldValue(
			ProductNavigationProductMenuHelperImpl.class, "_SHOW_PRODUCT_MENU");

	private final ProductNavigationProductMenuHelperImpl
		_productNavigationProductMenuHelperImpl =
			new ProductNavigationProductMenuHelperImpl();

}