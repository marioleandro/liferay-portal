/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.action;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCRenderCommand;
import com.liferay.portal.language.override.constants.PLOPortletKeys;

import org.osgi.service.component.annotations.Component;

/**
 * @author Mario Leandro
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"jakarta.portlet.name=" + PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE,
		"mvc.command.name=/portal_language_override/import_translations"
	},
	service = MVCRenderCommand.class
)
public class ImportTranslationsMVCRenderCommand
	extends BasePLOMVCRenderCommand {

	@Override
	protected String getJspPath() {
		return "/configuration/icon/import_translations.jsp";
	}

}