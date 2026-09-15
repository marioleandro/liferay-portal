/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.action;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCActionCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCActionCommand;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.language.override.constants.PLOPortletKeys;
import com.liferay.portal.language.override.service.PLOEntryService;

import jakarta.portlet.ActionRequest;
import jakarta.portlet.ActionResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Leandro
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"jakarta.portlet.name=" + PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE,
		"mvc.command.name=/portal_language_override/delete_plo_entry"
	},
	service = MVCActionCommand.class
)
public class DeletePLOEntryMVCActionCommand extends BaseMVCActionCommand {

	@Override
	protected void doProcessAction(
			ActionRequest actionRequest, ActionResponse actionResponse)
		throws Exception {

		_ploEntryService.deletePLOEntry(
			ParamUtil.getString(actionRequest, "key"),
			ParamUtil.getString(actionRequest, "selectedLanguageId"));
	}

	@Reference
	private PLOEntryService _ploEntryService;

}