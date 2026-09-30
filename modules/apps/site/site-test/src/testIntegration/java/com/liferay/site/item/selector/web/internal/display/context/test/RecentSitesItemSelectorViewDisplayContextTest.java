/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.item.selector.web.internal.display.context.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.item.selector.ItemSelectorView;
import com.liferay.layout.test.util.LayoutTestUtil;
import com.liferay.portal.kernel.dao.search.SearchContainer;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.servlet.PortletServlet;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.portlet.MockLiferayPortletRenderResponse;
import com.liferay.portal.kernel.test.portlet.MockLiferayPortletURL;
import com.liferay.portal.kernel.test.portlet.MockPortletRequest;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.SessionClicks;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.site.item.selector.SiteItemSelectorCriterion;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * @author Mario Leandro
 */
@RunWith(Arquillian.class)
public class RecentSitesItemSelectorViewDisplayContextTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();

		_layout = LayoutTestUtil.addTypeContentLayout(_group);

		_companyGroup = _groupLocalService.getCompanyGroup(
			TestPropsValues.getCompanyId());
	}

	@Test
	public void testGetGroupSearch() throws Exception {
		Assert.assertEquals(
			Arrays.asList(_companyGroup, _group),
			_getGroups(new SiteItemSelectorCriterion()));
	}

	@Test
	public void testGetGroupSearchWhenIncludeCompanyIsFalse() throws Exception {
		SiteItemSelectorCriterion siteItemSelectorCriterion =
			new SiteItemSelectorCriterion();

		siteItemSelectorCriterion.setIncludeCompany(false);

		Assert.assertEquals(
			Collections.singletonList(_group),
			_getGroups(siteItemSelectorCriterion));
	}

	private List<Group> _getGroups(
			SiteItemSelectorCriterion siteItemSelectorCriterion)
		throws Exception {

		HttpServletRequest httpServletRequest = _getMockHttpServletRequest();

		_itemSelectorView.renderHTML(
			httpServletRequest, new MockHttpServletResponse(),
			siteItemSelectorCriterion, new MockLiferayPortletURL(),
			RandomTestUtil.randomString(), false);

		SearchContainer<Group> searchContainer = ReflectionTestUtil.invoke(
			httpServletRequest.getAttribute(
				"SITES_ITEM_SELECTOR_DISPLAY_CONTEXT"),
			"getGroupSearch", new Class<?>[0]);

		return searchContainer.getResults();
	}

	private MockHttpServletRequest _getMockHttpServletRequest()
		throws Exception {

		MockHttpServletRequest mockHttpServletRequest =
			new MockHttpServletRequest();

		MockPortletRequest mockPortletRequest = new MockPortletRequest();

		mockPortletRequest.setAttribute(
			PortletServlet.PORTLET_SERVLET_REQUEST, mockHttpServletRequest);

		mockHttpServletRequest.setAttribute(
			JavaConstants.JAKARTA_PORTLET_REQUEST, mockPortletRequest);

		mockHttpServletRequest.setAttribute(
			JavaConstants.JAKARTA_PORTLET_RESPONSE,
			new MockLiferayPortletRenderResponse());

		ThemeDisplay themeDisplay = new ThemeDisplay();

		themeDisplay.setCompany(
			_companyLocalService.getCompany(TestPropsValues.getCompanyId()));
		themeDisplay.setLayout(_layout);
		themeDisplay.setLocale(LocaleUtil.getDefault());
		themeDisplay.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(TestPropsValues.getUser()));
		themeDisplay.setScopeGroupId(_group.getGroupId());
		themeDisplay.setSignedIn(true);
		themeDisplay.setSiteGroupId(_group.getGroupId());
		themeDisplay.setUser(TestPropsValues.getUser());

		mockHttpServletRequest.setAttribute(
			WebKeys.THEME_DISPLAY, themeDisplay);

		mockPortletRequest.setAttribute(WebKeys.THEME_DISPLAY, themeDisplay);

		mockHttpServletRequest.setAttribute(
			WebKeys.USER, TestPropsValues.getUser());

		SessionClicks.put(
			mockHttpServletRequest.getSession(),
			"com.liferay.site.util_recentGroups",
			StringUtil.merge(
				new long[] {_companyGroup.getGroupId(), _group.getGroupId()}));

		return mockHttpServletRequest;
	}

	private Group _companyGroup;

	@Inject
	private CompanyLocalService _companyLocalService;

	@DeleteAfterTestRun
	private Group _group;

	@Inject
	private GroupLocalService _groupLocalService;

	@Inject(
		filter = "component.name=com.liferay.site.item.selector.web.internal.RecentSitesItemSelectorView",
		type = ItemSelectorView.class
	)
	private ItemSelectorView<SiteItemSelectorCriterion> _itemSelectorView;

	private Layout _layout;

}