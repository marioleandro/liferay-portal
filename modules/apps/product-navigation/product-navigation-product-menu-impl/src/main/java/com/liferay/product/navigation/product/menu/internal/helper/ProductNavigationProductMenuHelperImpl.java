/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.product.navigation.product.menu.internal.helper;

import com.liferay.application.list.PanelAppRegistry;
import com.liferay.application.list.PanelCategory;
import com.liferay.application.list.constants.PanelCategoryKeys;
import com.liferay.application.list.display.context.logic.PanelCategoryHelper;
import com.liferay.application.list.util.PanelCategoryRegistryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.product.navigation.product.menu.helper.ProductNavigationProductMenuHelper;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Eudaldo Alonso
 */
@Component(service = ProductNavigationProductMenuHelper.class)
public class ProductNavigationProductMenuHelperImpl
	implements ProductNavigationProductMenuHelper {

	@Override
	public boolean isShowProductMenu(HttpServletRequest httpServletRequest) {
		Boolean showProductMenu = (Boolean)httpServletRequest.getAttribute(
			_SHOW_PRODUCT_MENU);

		if (showProductMenu == null) {
			showProductMenu = _isShowProductMenu(httpServletRequest);

			httpServletRequest.setAttribute(
				_SHOW_PRODUCT_MENU, showProductMenu);
		}

		return showProductMenu;
	}

	private boolean _isApplicationsMenuApp(ThemeDisplay themeDisplay) {
		if (Validator.isNull(themeDisplay.getPpid())) {
			return false;
		}

		PanelCategoryHelper panelCategoryHelper = new PanelCategoryHelper(
			_panelAppRegistry);

		if (!panelCategoryHelper.isApplicationsMenuApp(
				themeDisplay.getPpid())) {

			return false;
		}

		Layout layout = themeDisplay.getLayout();

		if ((layout != null) && !layout.isTypeControlPanel()) {
			return false;
		}

		return true;
	}

	private boolean _isShowProductMenu(HttpServletRequest httpServletRequest) {
		ThemeDisplay themeDisplay =
			(ThemeDisplay)httpServletRequest.getAttribute(
				WebKeys.THEME_DISPLAY);

		if (!themeDisplay.isSignedIn()) {
			return false;
		}

		User user = themeDisplay.getUser();

		if ((!themeDisplay.isImpersonated() && !user.isSetupComplete()) ||
			_isApplicationsMenuApp(themeDisplay)) {

			return false;
		}

		Group scopeGroup = themeDisplay.getScopeGroup();

		if (scopeGroup.isDepot()) {
			return false;
		}

		List<PanelCategory> childPanelCategories =
			PanelCategoryRegistryUtil.getChildPanelCategories(
				PanelCategoryKeys.ROOT, themeDisplay.getPermissionChecker(),
				themeDisplay.getScopeGroup());

		return !childPanelCategories.isEmpty();
	}

	private static final String _SHOW_PRODUCT_MENU =
		ProductNavigationProductMenuHelperImpl.class.getName() +
			"#SHOW_PRODUCT_MENU";

	@Reference
	private PanelAppRegistry _panelAppRegistry;

}