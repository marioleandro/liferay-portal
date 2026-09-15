/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.portlet.action;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.portlet.PortletResponseUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.util.ContentTypes;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.zip.ZipWriter;
import com.liferay.portal.kernel.zip.ZipWriterFactory;
import com.liferay.portal.language.override.constants.PLOPortletKeys;
import com.liferay.portal.language.override.model.PLOEntry;
import com.liferay.portal.language.override.service.PLOEntryService;

import jakarta.portlet.ResourceRequest;
import jakarta.portlet.ResourceResponse;

import java.io.FileInputStream;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Leandro
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"jakarta.portlet.name=" + PLOPortletKeys.PORTAL_LANGUAGE_OVERRIDE,
		"mvc.command.name=/portal_language_override/export_plo_entries"
	},
	service = MVCResourceCommand.class
)
public class ExportPLOEntriesMVCResourceCommand extends BaseMVCResourceCommand {

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws Exception {

		ZipWriter zipWriter = _zipWriterFactory.getZipWriter();

		Map<String, List<PLOEntry>> languageIdPLOEntries = new HashMap<>();

		for (PLOEntry ploEntry : _ploEntryService.getPLOEntries()) {
			List<PLOEntry> ploEntries = languageIdPLOEntries.computeIfAbsent(
				ploEntry.getLanguageId(), languageId -> new ArrayList<>());

			ploEntries.add(ploEntry);
		}

		for (Map.Entry<String, List<PLOEntry>> entry :
				languageIdPLOEntries.entrySet()) {

			StringBundler sb = new StringBundler();

			for (PLOEntry ploEntry : entry.getValue()) {
				sb.append(ploEntry.getKey());
				sb.append(StringPool.EQUAL);
				sb.append(ploEntry.getValue());
				sb.append(StringPool.NEW_LINE);
			}

			zipWriter.addEntry(
				"Language_" + entry.getKey() + ".properties", sb.toString());
		}

		PortletResponseUtil.sendFile(
			resourceRequest, resourceResponse,
			StringUtil.randomString() + ".zip",
			new FileInputStream(zipWriter.getFile()),
			ContentTypes.APPLICATION_ZIP);
	}

	@Reference
	private PLOEntryService _ploEntryService;

	@Reference
	private ZipWriterFactory _zipWriterFactory;

}