/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.action;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCRenderCommand;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.language.override.constants.PLOPortletKeys;
import com.liferay.portal.language.override.web.internal.display.context.EditDisplayContextFactory;

import jakarta.portlet.RenderRequest;

import jakarta.servlet.http.HttpServletRequest;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Leandro
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"jakarta.portlet.name=" + PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE,
		"mvc.command.name=/portal_language_override/edit_plo_entry"
	},
	service = MVCRenderCommand.class
)
public class EditPLOEntryMVCRenderCommand extends BasePLOMVCRenderCommand {

	@Override
	protected String getJspPath() {
		return "/edit_plo_entry.jsp";
	}

	@Override
	protected void setAttributes(
		HttpServletRequest httpServletRequest, RenderRequest renderRequest) {

		httpServletRequest.setAttribute(
			WebKeys.PORTLET_DISPLAY_CONTEXT,
			_editDisplayContextFactory.create(renderRequest));
	}

	@Reference
	private EditDisplayContextFactory _editDisplayContextFactory;

}